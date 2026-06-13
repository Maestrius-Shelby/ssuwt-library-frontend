import React, { useEffect, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setAuthTokens,
  removeAuthTokens,
  getUser,
} from "../ReduxStore/reducers/authSlice";
import {
  selectAuthTokens,
  selectIsAuthenticated,
} from "../ReduxStore/selectors/authSelectors";
import api from "../API/axiosInstance";
import {
  clearFrontendError,
  setFrontendError,
} from "../ReduxStore/reducers/frontendErrorSlice";
import {
  setBackendDown,
  setBackendUp,
  setFrontendDown,
  setFrontendUp,
} from "../ReduxStore/reducers/serverStatusSlice";
import {
  clearBackendError,
  setBackendError,
} from "../ReduxStore/reducers/backendErrorSlice";
import { jwtDecode } from "jwt-decode";

const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authTokens = useSelector(selectAuthTokens);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const navigate = useNavigate();

  const [serverFrontendErrorShown, setServerFrontendErrorShown] =
    useState(false);
  const [serverBackendErrorShown, setServerBackendErrorShown] = useState(false);

  const updateToken = useCallback(async () => {
    try {
      const response = await api.post("token/refresh/", {
        refresh: authTokens?.refresh,
      });

      const data = response.data;
      dispatch(setAuthTokens(data));
      dispatch(setFrontendUp());
      setServerFrontendErrorShown(false);
      localStorage.setItem("authTokens", JSON.stringify(data));
      dispatch(getUser());
    } catch (error) {
      if (!error.response) {
        if (!serverFrontendErrorShown) {
          dispatch(setFrontendError("Сервер не отвечает. Выход из аккаунта..."));
          setServerFrontendErrorShown(true);
        }
        dispatch(removeAuthTokens());
        localStorage.removeItem("authTokens");
        dispatch(setFrontendDown());
        navigate("/about");
        return;
      }

      console.error("Ошибка обновления токена:", error);
      dispatch(removeAuthTokens());
      localStorage.removeItem("authTokens");
      navigate("/about");
    }
  }, [authTokens, dispatch, navigate, serverFrontendErrorShown]);

  useEffect(() => {
    const tokens = localStorage.getItem("authTokens");

    const checkBackendServerStatus = async () => {
      try {
        const response = await api.get("health/");
        if (response.status === 200) {
          dispatch(setBackendUp());
          setServerBackendErrorShown(false);
          dispatch(clearBackendError());
        }
      } catch {
        dispatch(setBackendDown());
        setServerBackendErrorShown((prev) => {
          if (!prev) {
            dispatch(
              setBackendError("Не удалось подключиться к серверу. Мы уже работаем над решением.")
            );
          }
          return true;
        });

        // Если сервер недоступен и токены есть, выходим из аккаунта
        if (tokens) {
          dispatch(removeAuthTokens());
          localStorage.removeItem("authTokens");
          navigate("/about");
        }
      }
    };

    if (!tokens || !isAuthenticated) {
      // Если нет токенов или пользователь не аутентифицирован, просто проверяем бэкенд
      checkBackendServerStatus();
      const interval = setInterval(checkBackendServerStatus, 5000); // Проверка каждые 5 секунд

      return () => clearInterval(interval);
    }

    // Если токены есть и пользователь аутентифицирован, проверяем бэкенд
    checkBackendServerStatus();
    const interval = setInterval(checkBackendServerStatus, 5000); // Проверка каждые 5 секунд

    return () => clearInterval(interval);
  }, [dispatch, serverBackendErrorShown, isAuthenticated, navigate]);

  useEffect(() => {
    const checkFrontendServerStatus = async () => {
      try {
        await fetch(window.location.origin, { method: "HEAD" });
        dispatch(setFrontendUp());

        setServerFrontendErrorShown(false);
        dispatch(clearFrontendError());
      } catch {
        dispatch(setFrontendDown());

        setServerFrontendErrorShown((prev) => {
          if (!prev) {
            dispatch(
              setFrontendError(
                "Не удалось подключиться к серверу. Мы уже работаем над решением."
              )
            );
          }
          return true;
        });
      }
    };

    checkFrontendServerStatus();
    const interval = setInterval(checkFrontendServerStatus, 5000);

    return () => clearInterval(interval);
  }, [dispatch, serverFrontendErrorShown]);

  useEffect(() => {
    const tokens = localStorage.getItem("authTokens");
    if (tokens) {
      const parsedTokens = JSON.parse(tokens);
      dispatch(setAuthTokens(parsedTokens));
      dispatch(getUser());
    }
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        window.location.reload();
      }, 5);
    }
  }, [isAuthenticated]);

  const isTokenExpired = (token) => {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  };
  
  useEffect(() => {
    const REFRESH_INTERVAL = 1000 * 60 * 59;
    const interval = setInterval(() => {
      if (authTokens && isTokenExpired(authTokens.access)) {
        updateToken();
      }
    }, REFRESH_INTERVAL);
  
    return () => clearInterval(interval);
  }, [authTokens, updateToken]);

  return <>{children}</>;
};

export default AuthProvider;
