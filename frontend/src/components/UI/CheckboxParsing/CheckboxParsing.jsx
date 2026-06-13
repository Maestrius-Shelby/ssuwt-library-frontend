import React from 'react';
import styles from './CheckboxParsing.module.css';

const CheckboxParsing = ({ checked, onChange, hasError }) => {
    return (
        
        <label className={`${styles.check} ${styles.parsingCheck} ${hasError ? styles.errorCheck : ''}`}>
            <input type="checkbox" checked={checked} onChange={onChange} className={styles.hiddenCheckbox} />
            <svg width="18px" height="18px" viewBox="0 0 18 18">
                <path d="M1,9 L1,3.5 C1,2 2,1 3.5,1 L14.5,1 C16,1 17,2 17,3.5 L17,14.5 C17,16 16,17 14.5,17 L3.5,17 C2,17 1,16 1,14.5 L1,9 Z"></path>
                {hasError ? (
                    <>
                        <line x1="4" y1="4" x2="14" y2="14" className={styles.cross} />
                        <line x1="14" y1="4" x2="4" y2="14" className={styles.cross} />
                    </>
                ) : (
                    <polyline points="1 9 7 14 15 4" className={styles.checkmark}></polyline>
                )}
            </svg>
        </label>
    );
};

export default CheckboxParsing;
