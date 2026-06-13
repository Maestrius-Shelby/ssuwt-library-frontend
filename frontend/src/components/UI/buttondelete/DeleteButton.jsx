import React from 'react';
import classes from './DeleteButton.module.css';

const DeleteButton = ({ children, disabled, ...props }) => {
    return (
        <button
            {...props}
            className={`${classes.mydBtn} ${disabled ? classes.disableddBtn : ''}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default DeleteButton;