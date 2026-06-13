import React from 'react';
import styles from './ModalParsingInstrukt.module.css';
import MyButton from '../button/MyButton';

const ModalParsingInstrukt = ({ setVisible }) => {
    const closeModal = () => {
        setVisible(false); 
    };
    return (
        <div className={styles.container}>

            <div className={styles.toptext}>
                <h1>Инструкция</h1>
                <p>Здесь представлена подробная инструкция по переносу научных работ. Следуйте шагам, чтобы легко и эффективно перенести данные с платформы e-library.</p>
            </div>

            <div className={styles.text}>
                <p>1. Перейдите на портал e-library.</p>
                <p>2. Выполните авторизацию на платформе.</p>
                <p>3. В меню навигации откройте раздел «Авторы».</p>
                <p>4. Найдите нужного автора и скопируйте ссылку на его работы. Убедитесь, что ссылка имеет формат https://www.elibrary.ru/author_items.asp?authorid=(номер профиля) или https://elibrary.ru/author_items.asp?authorid=(номер профиля)</p>
                <p>5. Вставьте скопированную ссылку в соответствующее поле на нашем сайте.</p>
                <p>6. Нажмите кнопку «Запустить процесс импорта» и ожидайте завершения.</p>
                <p>7. В режиме предпросмотра проверьте корректность перенесённых данных.</p>
                <p>8. При необходимости отредактируйте информацию непосредственно в таблице.</p>
                <p>9. Подтвердите добавление работ: отметьте их галочками и нажмите «Подтвердить импорт».</p>
                
                <p>Если парсинг не запускается - обратитесь к администрации.</p>
            </div>

            <div className={styles.buttomcontainer}>
                <MyButton onClick={closeModal}
                    >Понятно
                </MyButton>
            </div>

        </div>
        
    );
};

export default ModalParsingInstrukt;
