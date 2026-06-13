import React, { useRef } from 'react';
import { CSSTransition } from 'react-transition-group';
import styles from './NotificationWarning.module.css';
import {ReactComponent as WarningIcon } from '../Icons/IconWarning.svg'

const NotificationWarning = ({ message, show }) => {

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
                    <WarningIcon className={styles.notificationIcon} />
                        <div className={styles.notificationText}>
                            <div className={styles.notificationHead}>
                                Предупреждение!
                            </div>
                            <p>{message}</p>
                        </div>
                </div>
            </div>
        </CSSTransition>
    );
};

export default NotificationWarning;
