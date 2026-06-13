import React from 'react';
import classes from './MyButton.module.css';

const MyButton = ({ children, disabled, ...props }) => {
    return (
        <button
            {...props}
            className={`${classes.myBtn} ${disabled ? classes.disabledBtn : ''}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default MyButton;