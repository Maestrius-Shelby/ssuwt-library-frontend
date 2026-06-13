import React from "react";
import ErrorIcon from '../Icons/IconError.svg'
// import styles from "./BackendServerError.module.css";

const BackendServerError = () => {
  return (
    <div className="backend-server-error">
      <div className="backend-server-error-conteiner">
        <div className="backend-server-error-info">
          <img src={ErrorIcon} alt="erroricon" className="backend-server-error-icon" />
          <h2 className="backend-server-error-head">Упс, сервер прилёг отдохнуть...</h2>
          <p className="backend-server-error-desc">Мы уже работаем над тем, чтобы вернуть его в строй. <br/>Попробуйте зайти чуть позже — обещаем, всё будет в порядке!</p>
        </div>
      </div>
    </div>
  );
};

export default BackendServerError;