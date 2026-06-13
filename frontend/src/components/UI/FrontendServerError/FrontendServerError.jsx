import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import styles from './FrontendServerError.module.css';


const ErrorGlobalComponent = () => {
  const errorMessage = useSelector((state) => state.frontendError.message);
  const isServerDown = useSelector((state) => state.serverStatus.isServerDown);

  useEffect(() => {
    if (!isServerDown) {
      const hasReloaded = sessionStorage.getItem('hasReloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('hasReloaded', 'true'); // Запоминаем, что перезагрузили
        setTimeout(() => {
          window.location.reload();
        }, 1000); // Перезагрузка через секунду
      }
    } else {
      sessionStorage.removeItem('hasReloaded'); // Если сервер упал, сбрасываем флаг
    }
  }, [isServerDown]);
  
  if (!errorMessage) return null;

  return (
    <div className={styles.errorOverlay}>
      <div className={styles.errorContainer}>
      <div className={styles.errorInfo}>
      <h2 className={styles.errorHead}>Упс, связь оборвалась!</h2>
        <p className={styles.errorText}>{errorMessage}</p>
      </div>
      </div>
    </div>
  );
};

export default ErrorGlobalComponent;
