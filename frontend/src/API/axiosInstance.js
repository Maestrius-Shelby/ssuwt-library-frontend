import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL:  process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

const mediaAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_MEDIA_URL,
  withCredentials: true,
});

// Перехватчик для добавления CSRF-токена и токена авторизации
axiosInstance.interceptors.request.use(
  (config) => {
    const csrfToken = Cookies.get("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }

    const authTokens = localStorage.getItem("authTokens");
    if (authTokens) {
      const parsedTokens = JSON.parse(authTokens);
      if (parsedTokens?.access) {
        config.headers["Authorization"] = `Bearer ${parsedTokens.access}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

const isTokenExpired = (token) => {
  const decodedToken = jwtDecode(token); // Декодируем токен с помощью библиотеки jwt-decode
  const currentTime = Date.now() / 1000; // Получаем текущее время в секундах (время Unix)
  return decodedToken.exp < currentTime; // Сравниваем время истечения токена (exp) с текущим временем
};

axiosInstance.interceptors.request.use(
  async (config) => {
    const authTokens = JSON.parse(localStorage.getItem("authTokens")); // Получаем токены из localStorage

    if (authTokens?.access && isTokenExpired(authTokens.access)) {
      // Проверяем, есть ли access-токен и истек ли он
      try {
        // Если токен истек, отправляем запрос на обновление токена
        const refreshResponse = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}token/refresh/`,
          { refresh: authTokens.refresh } // Используем refresh-токен для обновления
        );

        const newTokens = refreshResponse.data; // Получаем новые токены (access и refresh)
        localStorage.setItem("authTokens", JSON.stringify(newTokens)); // Сохраняем новые токены в localStorage
        config.headers["Authorization"] = `Bearer ${newTokens.access}`; // Обновляем заголовок Authorization в запросе
      } catch (refreshError) {
        // Если произошла ошибка при обновлении токена
        console.error("Ошибка обновления токена:", refreshError);
        localStorage.removeItem("authTokens"); // Удаляем токены из localStorage
        window.location.href = "/about"; // Перенаправляем пользователя на страницу /about
        return Promise.reject(refreshError); // Отклоняем промис с ошибкой
      }
    }

    return config; // Возвращаем обновленную конфигурацию запроса
  },
  (error) => Promise.reject(error) // Обработка ошибок в перехватчике
);

export default axiosInstance;
export { mediaAxiosInstance };
