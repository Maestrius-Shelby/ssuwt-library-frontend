import React from 'react';
import styles from './VerifyPart.module.css';

const VerifyPart = () => {

    return (
        <div className={styles.container}>
            <div className={styles.toptext}>
                <h1>Верификация работ</h1>
                <p>В данном разделе проверяются работы, отправленные пользователями. 
                    При необходимости имеется возможность оставления комментарий автору. 
                    После успешной верификации работа будет доступна для общего просмотра в списке опубликованных.</p>
            </div>
        </div>
    );
};

export default VerifyPart;
