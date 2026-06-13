import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './NotificationSuccess.module.css';
import {ReactComponent as IconSuccess } from '../Icons/IconSuccess.svg'

const NotificationSuccess = ({ message, show }) => {

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
                    <IconSuccess className={styles.notificationIcon} />
                        <div className={styles.notificationText}>
                            <div className={styles.notificationHead}>
                                Успех!
                            </div>
                            <p>{message}</p>
                        </div>
                </div>
            </div>
        </CSSTransition>
    );
};

export default NotificationSuccess;
