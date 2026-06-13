import React, { useState, useEffect } from 'react';
import logo from '../Logo/logo.png';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../../ReduxStore/selectors/authSelectors';
import { makeSelectData } from '../../../ReduxStore/selectors/dataSelectors';

const Header = () => {
    const [currentDate, setCurrentDate] = useState(new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }));

    const user = useSelector(selectUser);
    const { currentUser } = useSelector(makeSelectData);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentDate(new Date().toLocaleString('ru-RU', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }));
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="header">
            <div className="dateUserSection">
             <p>Сегодня: {currentDate}</p>
             {user ? (
               <div>
                 <p className="headerusername">{currentUser?.fio}</p>
               </div>
             ) : (
               <p className="headerusername">Гость</p>
             )}
            </div>
            <div className="centerSection">
                <Link to="/about">
                    <img src={logo} alt="Logo" className="logo" />
                </Link>
            </div>
        </div>
    );
};

export default Header;