import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../API/axiosInstance";
import { jwtDecode } from "jwt-decode";

// Начальное состояние
const initialState = {
  user: localStorage.getItem("authTokens")
    ? jwtDecode(JSON.parse(localStorage.getItem("authTokens")).access)
    : null,
  authTokens: localStorage.getItem("authTokens")
    ? JSON.parse(localStorage.getItem("authTokens"))
    : null,
  loading: false,
  isAuthenticated: false, // Новый флаг
};

// Асинхронная функция для логина
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password, setError }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await api.post("token/", { username, password });
      localStorage.setItem("authTokens", JSON.stringify(data));
      dispatch(setAuthTokens(data));
      dispatch(setIsAuthenticated(true));
      return data;
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Аккаунт не найден. Проверьте введенные данные.");
      } else {
        setError("Что-то пошло не так. Попробуйте снова.");
      }
      return rejectWithValue(error.response?.data || "Ошибка при авторизации");
    }
  }
);

// Асинхронная функция для логаута
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { dispatch }) => {
    localStorage.removeItem("authTokens");
    dispatch(removeAuthTokens());
  }
);

export const getUser = createAsyncThunk(
  "auth/getUser",
  async (_, { rejectWithValue, getState }) => {
    const state = getState();
    const authTokens = state.auth.authTokens;

    if (!authTokens) {
      return rejectWithValue("Необходима авторизация");
    }

    try {
      const response = await api.post(
        "get_user/",
        {},
        {
          headers: {
            Authorization: `Bearer ${authTokens.access}`,
          },
        }
      );
      return {
        username: response.data.username,
        role:
          response.data.groups.length > 0 ? response.data.groups[0] : "Гость",
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Ошибка при получении пользователя"
      );
    }
  }
);

// Создаем слайс
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthTokens(state, action) {
      if (state.authTokens?.access !== action.payload.access) { // Проверяем, изменился ли access-токен
        state.authTokens = action.payload; // Обновляем токены
        state.user = { ...state.user, ...jwtDecode(action.payload.access) }; // Обновляем данные пользователя прямо из токена
      }
    },
    removeAuthTokens(state) {
      state.authTokens = null;
      state.user = null;
      state.isAuthenticated = false;
    },
    setIsAuthenticated(state, action) {
      state.isAuthenticated = action.payload;
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.fulfilled, (state, action) => {
        state.authTokens = action.payload; // Сохраняем токены в состоянии
        state.user = jwtDecode(action.payload.access); // Декодируем access-токен и сохраняем данные пользователя
        state.loading = false; // Устанавливаем loading в false, так как запрос завершен
      })
      .addCase(loginUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.authTokens = null;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        const newUserData = { ...state.user, ...action.payload }; // Объединяем текущие данные пользователя с новыми
        if (JSON.stringify(state.user) !== JSON.stringify(newUserData)) { // Проверяем, изменились ли данные
          state.user = newUserData; // Обновляем данные пользователя, если они изменились
        }
      })
      .addCase(getUser.rejected, (state) => {
        state.user = null;
      });
  },
});

export const {
  setAuthTokens,
  removeAuthTokens,
  setIsAuthenticated,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
