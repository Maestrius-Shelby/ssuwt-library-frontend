import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './NotificationError.module.css';
import {ReactComponent as NotIcon } from '../Icons/IconWrapper.svg'

const NotificationError = ({ message, show }) => {

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
                    <NotIcon className={styles.notificationIcon} />
                        <div className={styles.notificationText}>
                            <div className={styles.notificationHead}>
                                Ошибка!
                            </div>
                            <p>{message}</p>
                        </div>
                </div>
            </div>
        </CSSTransition>
    );
};

export default NotificationError;