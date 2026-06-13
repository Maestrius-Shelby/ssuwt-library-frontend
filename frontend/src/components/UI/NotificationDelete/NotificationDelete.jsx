import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './NotificationDelete.module.css';
import IconDelete from '../Icons/IconDelete.svg'

const NotificationDelete = ({ message, show }) => {

    const nodeRef = useRef(null);

    return (
        <CSSTransition
            in={show}
            timeout={500}
            classNames={{
                enter: styles.notificationEnter,
                enterActive: styles.notificationEnterActive,
                exit: styles.notificationExit,
                exitActive: styles.notificationExitActive,
            }}
            unmountOnExit
            nodeRef={nodeRef}
        >
            <div ref={nodeRef} className={styles.notification}>
                <div className={styles.notificationContent}>
                    <img src={IconDelete} alt="IconDelete" className={styles.notificationIcon} />
                        <div className={styles.notificationText}>
                            <div className={styles.notificationHead}>
                                Удалено!
                            </div>
                            <p>{message}</p>
                        </div>
                </div>
            </div>
        </CSSTransition>
    );
};

export default NotificationDelete;