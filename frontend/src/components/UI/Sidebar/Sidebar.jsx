import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MyButton from "../button/MyButton";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../../ReduxStore/selectors/authSelectors";
import { loginUser, logoutUser } from "../../../ReduxStore/reducers/authSlice";
import SidebarUser from "../SidebarUser/SidebarUser";
import { fetchHumanByUserId } from "../../../ReduxStore/reducers/dataSlice";
import { makeSelectData } from "../../../ReduxStore/selectors/dataSelectors";
import EyeOn from "../Icons/eye.svg";
import EyeOff from "../Icons/eyeoff.svg";

const Sidebar = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const [authError, setAuthError] = useState("");
  const { currentUser, userId } = useSelector(makeSelectData);

  useEffect(() => {
    if (userId && !currentUser) {
      dispatch(fetchHumanByUserId(userId));
    }
  }, [userId, currentUser, dispatch]);

  const handleUsernameChange = (e) => {
    let value = e.target.value.slice(0, 50);
    setUsername(value);

    if (isSubmitted) {
      validateFields(value, password);
    }
  };

  const handlePasswordChange = (e) => {
    let value = e.target.value.slice(0, 20);
    setPassword(value);

    if (isSubmitted) {
      validateFields(username, value);
    }
  };

  const validateFields = (user, pass) => {
    let newErrors = {};

    if (!user.trim()) {
      newErrors.userName = "Заполните поле";
    }
    // else if (!/^[a-zA-Z0-9]{4,}$/.test(user)) {
    //   newErrors.userName = "Логин должен содержать минимум 4 символа, латинские буквы или цифры";
    // }

    if (!pass.trim()) {
      newErrors.password = "Заполните поле";
    }
    // else if (!/^(?=.*[a-zA-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/.test(pass)) {
    //   newErrors.password =
    //     "Пароль должен содержать минимум 8 символов, одну латинскую букву, одну цифру и один специальный символ";
    // }

    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    validateFields(username, password);

    if (!errors.userName && !errors.password) {
      setAuthError("");
      dispatch(loginUser({ username, password, setError: setAuthError }));
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/");
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    const usernameInput = document.querySelector("input[name='userName']");
    const passwordInput = document.querySelector("input[name='password']");

    if (!usernameInput || !passwordInput) return;

    const observer = new MutationObserver(() => {
      setUsername(usernameInput.value);
      setPassword(passwordInput.value);
    });

    observer.observe(usernameInput, {
      attributes: true,
      attributeFilter: ["value"],
    });
    observer.observe(passwordInput, {
      attributes: true,
      attributeFilter: ["value"],
    });

    return () => observer.disconnect();
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && username.trim() && password.trim()) {
      handleSubmit(e);
    }
  };

  if (user) {
    return (
      <div>
        <SidebarUser handleLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-border">
        <h2>Авторизация</h2>

        <div className="input-container">
          <label className="label">Логин</label>
          <input
            type="text"
            name="userName"
            onChange={handleUsernameChange}
            onKeyDown={handleKeyDown}
            className={`input ${isSubmitted && errors.userName ? "error" : ""}`}
            value={username}
          />
          {isSubmitted && errors.userName && (
            <span className="errorMessage">{errors.userName}</span>
          )}
        </div>

        <div className="input-container">
          <label className="label">Пароль</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              onChange={handlePasswordChange}
              onKeyDown={handleKeyDown}
              className={`input ${
                isSubmitted && errors.password ? "error" : ""
              }`}
              value={password}
              autoComplete="new-password" // отключаем автозаполнение
            />
            <img
              src={showPassword ? EyeOff : EyeOn}
              alt="Toggle password visibility"
              className="password-toggle"
              onClick={togglePasswordVisibility}
            />
          </div>
          {isSubmitted && errors.password && (
            <span className="errorMessage">{errors.password}</span>
          )}
        </div>

        {authError && <span className="authError">{authError}</span>}
        <br />
        <div className="buttonContainerSide">
          <MyButton
            onClick={handleSubmit}
            disabled={!username.trim() || !password.trim()}
          >
            Войти
          </MyButton>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;