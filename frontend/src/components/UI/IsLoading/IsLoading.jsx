import React from 'react';
import styles from './IsLoading.module.css';

const IsLoading = () => {
    return (
        <div className={styles.loaderContainer}>
            <div className={styles.loader}></div>
            <span>Загрузка...</span>
        </div>
    );
};

export default IsLoading;