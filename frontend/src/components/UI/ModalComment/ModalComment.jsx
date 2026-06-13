import React from 'react';
import styles from './ModalComment.module.css';
import MyButton from '../button/MyButton';

const ModalComment = () => {
    
    return (
        <div className={styles.container}>
            <div className={styles.toptext}>
                    <h1>Комментирование работы</h1>
                    <p>
                      В комментарии можно указать возможные недочеты, которые помешали успешной верификации. 
                      Ваши замечания помогут автору внести необходимые исправления в научный материал, чтобы он соответствовал требуемым критериям.
                    </p>
            </div>

            <textarea
                className={styles.textarea}
                placeholder="Напишите ваш отзыв..."
            />
                <div className={styles.buttonGroup}>
                    <MyButton
                        type="submit"
                    >
                        Отправить
                    </MyButton>
                </div>
        </div>
    );
};

export default ModalComment;
