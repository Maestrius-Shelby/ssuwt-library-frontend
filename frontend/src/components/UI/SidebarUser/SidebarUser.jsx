import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './SidebarUser.module.css';
import { useSelector } from 'react-redux';
import { makeSelectData } from '../../../ReduxStore/selectors/dataSelectors';

const SidebarUser = ({ handleLogout }) => {
    const [lastUrlSegment, setLastUrlSegment] = useState('');
    const location = useLocation();
    const { currentUser } = useSelector(makeSelectData);
    const isHeadOfDepartment = currentUser?.job_title === 'Заведующий кафедры';

    useEffect(() => {
        const url = location.pathname;
        const segments = url.split('/').filter(segment => segment.length > 0);
        setLastUrlSegment(segments.length > 0 ? segments[segments.length - 1] : '');
    }, [location]);

    return (
        <div className={styles.sidebar}>
            <div className={styles.sidebarBorder}>
                <div className={styles.nameplace}>
                    <h2>Приветствуем, {currentUser?.fio}</h2>
                </div>
                <div className='block nav'>
                    <div className={styles.link}>
                        <Link
                            to="/about"
                            className={`${styles.alink} ${lastUrlSegment === 'about' ? styles.active : ''}`}
                            onClick={() => setLastUrlSegment('about')}
                        >
                            Главный экран
                        </Link>
                    </div>
                    <div className={styles.link}>
                        <Link
                            to="/personalpage"
                            className={`${styles.alink} ${lastUrlSegment === 'personalpage' ? styles.active : ''}`}
                            onClick={() => setLastUrlSegment('personalpage')}
                        >
                            Личный профиль
                        </Link>
                    </div>
                </div>
                <div className='block work'>
                    <div className={styles.link}>
                        <Link
                            to="/add"
                            className={`${styles.alink} ${lastUrlSegment === 'add' ? styles.active : ''}`}
                            onClick={() => setLastUrlSegment('add')}
                        >
                            Добавить документ
                        </Link>
                    </div>

                    <div className={styles.link}>
                        <Link
                            to="/addparticdb"
                            className={`${styles.alink} ${lastUrlSegment === 'addparticdb' ? styles.active : ''}`}
                            onClick={() => setLastUrlSegment('addparticdb')}
                        >
                            Добавить участника
                        </Link>
                    </div>

                    {isHeadOfDepartment && (
                        <>
                            <div className={styles.link}>
                                <Link
                                    to="/verifypage"
                                    className={`${styles.alink} ${lastUrlSegment === 'verifypage' ? styles.active : ''}`}
                                    onClick={() => setLastUrlSegment('verifypage')}
                                >
                                    Верификация работ
                                </Link>
                            </div>

                            <div className={styles.link}>
                                <Link
                                    to="/parsingpage"
                                    className={`${styles.alink} ${lastUrlSegment === 'parsingpage' ? styles.active : ''}`}
                                    onClick={() => setLastUrlSegment('parsingpage')}
                                >
                                    Импорт работ
                                </Link>
                            </div>
                        </>
                    )}
                </div>
                <div className='block exit'>
                    <div className={styles.buttonContainerSide}>
                        <button className={styles.aExitBut} onClick={handleLogout}>
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SidebarUser;
