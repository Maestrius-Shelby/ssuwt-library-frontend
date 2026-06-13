import React from 'react';
import styles from './UploadFiles.module.css';

const UploadFiles = ({ form, handleFileChange, errors }) => {
    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFileChange(e);
    };

    const handleInputChange = (e) => {
        handleFileChange(e);
    };

    const handleFileRemove = () => {
        handleFileChange({ target: { files: null } }); // Передаем пустой файл для удаления
    };

    return (
        <div className={styles.uploadContainer}>
            <div
                className={styles.uploadArea}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    name="file"
                    onChange={handleInputChange}
                    id="fileInput"
                    className={styles.hiddenFileInput}
                />
                <label htmlFor="fileInput" className={styles.customFileButton}>
                    Перетащите или выберите файл
                </label>
            </div>
            {form.file && (
                <div className={`${styles.fileName} ${errors.file ? styles.errorFileName : ''}`}>
                    <span>Выбрано:  {form.file.name}</span>
                    <svg
                        className={styles.removeIcon}
                        onClick={handleFileRemove}
                        viewBox="0 0 18 18"
                        width="18px"
                        height="18px"
                    >
                        <line x1="4" y1="4" x2="14" y2="14" className={styles.cross} />
                        <line x1="14" y1="4" x2="4" y2="14" className={styles.cross} />
                    </svg>
                </div>
            )}
            {errors.file && (
                <span className={styles.errorMessage}>
                    {errors.file}
                </span>
            )}
        </div>
    );
};

export default UploadFiles;
