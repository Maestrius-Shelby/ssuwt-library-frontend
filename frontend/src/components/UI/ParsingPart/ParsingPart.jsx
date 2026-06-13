import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "./ParsingPart.module.css";
import MyButton from "../button/MyButton";
import MyModal from "../MyModal/MyModal";
import ModalParsingInstrukt from "../ModalParsingInstrukt/ModalParsingInstrukt";
import ModalImportInstrukt from "../ModalImportInstrukt/ModalImportInstrukt";
import {
  fetchParsingLockStatus,
  startImportProcess,
  startParsingProcess,
} from "../../../ReduxStore/reducers/parsingSlice";
import NotificationError from "../NotificationError/NotificationError";
import NotificationWarning from "../NotificationWarning/NotificationWarning";
import IsLoadingParsing from "../IsLoadingParsing/IsLoadingParsing";
import { getParsingLockStatus } from "../../../API/ParsingService";

const ParsingPart = () => {
  const [modalInstrukt, setModalInstrukt] = useState(false);
  const [modalInstrukt2, setModalInstrukt2] = useState(false);
  const [linkpage, setLinkpage] = useState("");
  const [isLoadingWizard, setIsLoadingWizard] = useState(false);
  const dispatch = useDispatch();
  const isParsingStarted = useSelector(
    (state) => state.parsing.isParsingStarted
  );
  const [showNotificationError, setShowNotificationError] = useState(false);
  const [showImportErrorNotification, setShowImportErrorNotification] =
    useState(false);
  const [isProcessBlocked, setIsProcessBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const navigate = useNavigate();
  const [importFile, setimportFile] = useState(null); // Добавляем состояние для файла
  const [showImportFileErrorNotification, setshowImportFileErrorNotification] =
    useState(false);

  const [activeTab, setActiveTab] = useState("elibrary");

  const linkPattern =
    /^https:\/\/(?:www\.)?elibrary\.ru\/author_items\.asp\?authorid=\d+$/;

  useEffect(() => {
    const storedTimeLeft = localStorage.getItem("timeLeft");
    const storedIsProcessBlocked =
      localStorage.getItem("isProcessBlocked") === "true";

    if (storedTimeLeft) {
      setTimeLeft(Number(storedTimeLeft));
    }

    if (storedIsProcessBlocked) {
      setIsProcessBlocked(true);
    }
  }, []);

  useEffect(() => {
    if (isProcessBlocked) {
      const countdown = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(countdown);
            setIsProcessBlocked(false);
            localStorage.setItem("isProcessBlocked", "false");
            localStorage.setItem("timeLeft", "0");
            return 0;
          }
          const newTime = prevTime - 1;
          localStorage.setItem("timeLeft", String(newTime));
          return newTime;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [isProcessBlocked]);

  useEffect(() => {
    const isParsingInitialized = localStorage.getItem("parsingInitialized");
    if (!isParsingStarted && !isParsingInitialized) {
      localStorage.setItem("parsingInitialized", "true");
    }
  }, [dispatch, isParsingStarted]);

  // Единоразовая проверка при монтировании
  useEffect(() => {
    dispatch(fetchParsingLockStatus())
      .unwrap()
      .then((status) => {
        if (status.is_locked && status.unlocked_at) {
          const now = new Date();
          const unlockTime = new Date(status.unlocked_at);
          const diffSeconds = Math.max(
            Math.floor((unlockTime - now) / 1000),
            0
          );

          setTimeLeft(diffSeconds);
          setIsProcessBlocked(true);

          localStorage.setItem("timeLeft", String(diffSeconds));
          localStorage.setItem("isProcessBlocked", "true");
        } else if (!status.is_locked) {
          // ✅ Сброс таймера если разблокировано
          setIsProcessBlocked(false);
          setTimeLeft(0);
          localStorage.setItem("timeLeft", "0");
          localStorage.setItem("isProcessBlocked", "false");
        }
      })
      .catch(console.error);
  }, [dispatch]);

  // ✅ Polling — периодическая проверка состояния
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchParsingLockStatus())
        .unwrap()
        .then((status) => {
          if (status.is_locked && status.unlocked_at) {
            const now = new Date();
            const unlockTime = new Date(status.unlocked_at);
            const diffSeconds = Math.max(
              Math.floor((unlockTime - now) / 1000),
              0
            );

            setTimeLeft(diffSeconds);
            setIsProcessBlocked(true);

            localStorage.setItem("timeLeft", String(diffSeconds));
            localStorage.setItem("isProcessBlocked", "true");
          } else {
            setIsProcessBlocked(false);
            setTimeLeft(0);
            localStorage.setItem("timeLeft", "0");
            localStorage.setItem("isProcessBlocked", "false");
          }
        })
        .catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleStartParsing = async () => {
    if (activeTab === "elibrary") {
      if (!linkpage || !linkPattern.test(linkpage)) {
        setShowNotificationError(true);
        setTimeout(() => setShowNotificationError(false), 3000);
        return;
      }
    }

    try {
      const status = await getParsingLockStatus();

      if (status.is_locked) {
        const unlockTime = new Date(status.unlocked_at);
        const now = new Date();
        const secondsLeft = Math.max(Math.floor((unlockTime - now) / 1000), 0);

        setIsProcessBlocked(true);
        setTimeLeft(secondsLeft);
        localStorage.setItem("isProcessBlocked", "true");
        localStorage.setItem("timeLeft", String(secondsLeft));
        return;
      }

      // Всё ок — можно запускать
      setIsLoadingWizard(true);
      dispatch(startParsingProcess({ url: linkpage }))
        .unwrap()
        .then(() => {
          setIsLoadingWizard(false);
          navigate("/parsingresultspage");
        })
        .catch(() => {
          setIsLoadingWizard(false);
          setShowImportErrorNotification(true);
          setTimeout(() => setShowImportErrorNotification(false), 3000);
        });
    } catch (error) {
      console.error("Ошибка при проверке блокировки:", error);
    }
  };

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  const handleStartImport = async () => {
    if (!importFile) {
      setshowImportFileErrorNotification(true);
      setTimeout(() => setshowImportFileErrorNotification(false), 3000);
      return;
    }

    const importFormFile = new FormData();
    importFormFile.append("file", importFile);

    setIsLoadingWizard(true); // Включаем индикатор загрузки

    try {
      const response = await dispatch(
        startImportProcess(importFormFile)
      ).unwrap();

      if (response?.payload) {
        // Если есть payload — показываем ошибку (например, файл неверного формата)
        setshowImportFileErrorNotification(true);
        setTimeout(() => setshowImportFileErrorNotification(false), 3000);
        return;
      }

      setIsLoadingWizard(false); // Выключаем загрузку
      navigate("/parsingresultspage"); // Успешная навигация
    } catch (error) {
      setIsLoadingWizard(false); // Выключаем загрузку при ошибке
      setShowImportErrorNotification(true);
      setTimeout(() => setShowImportErrorNotification(false), 3000);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) {
      setshowImportFileErrorNotification(true);
      setTimeout(() => setshowImportFileErrorNotification(false), 3000);
      return;
    }

    setimportFile(selectedFile);
    setshowImportFileErrorNotification(false);
  };

  const handleFileRemove = () => {
    setimportFile(null);
    setshowImportFileErrorNotification(false);
  };

  const handleLinkpageChange = (e) => {
    setLinkpage(e.target.value);
  };

  return (
    <div className={styles.container}>
      <div className={styles.toptext}>
        <h1>Импорт работ</h1>
        <p>
          Загрузить научные работы возможно с платформы e-library или из
          документа, оформленного по форме 16. <br />
          Укажите желаемый вариант в переключателе ниже.
        </p>

        <div className={styles.toggleContainer}>
          <div
            className={styles.toggleSlider}
            style={{
              transform:
                activeTab === "file" ? "translateX(100%)" : "translateX(0)",
            }}
          />
          <button
            className={`${styles.toggleButton} ${
              activeTab === "elibrary" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("elibrary")}
          >
            E-library
          </button>
          <button
            className={`${styles.toggleButton} ${
              activeTab === "file" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("file")}
          >
            Форма 16
          </button>
        </div>
      </div>

      {activeTab === "elibrary" && (
        <>
          <div className={styles.buttomcontainer}>
            <MyButton type="button" onClick={() => setModalInstrukt(true)}>
              Инструкция по e-library
            </MyButton>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Ссылка на страницу автора</label>
            <input
              type="text"
              name="linkpage"
              className={styles.input}
              value={linkpage}
              onChange={handleLinkpageChange}
            />
          </div>
          <div className={styles.buttomcontainer}>
            <MyButton
              type="button"
              onClick={handleStartParsing}
              disabled={isProcessBlocked || !linkpage}
            >
              {isProcessBlocked
                ? `Подождите ${formatTime(timeLeft)}`
                : "Запустить процесс парсинга"}
            </MyButton>
          </div>
        </>
      )}

      {activeTab === "file" && (
        <>
          <div className={styles.buttomcontainer}>
            <MyButton type="button" onClick={() => setModalInstrukt2(true)}>
              Инструкция по форме-16
            </MyButton>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Ваш файл с информацией</label>

            <div className={styles.fileInputContainer}>
              <div className={styles.fileNameWrapper}>
                <input
                  type="text"
                  readOnly
                  value={importFile ? importFile.name : ""}
                  className={styles.fileNameInput}
                />
                {importFile && (
                  <svg
                    className={styles.removeIcon}
                    onClick={handleFileRemove}
                    viewBox="0 0 18 18"
                    width="18px"
                    height="18px"
                  >
                    <line
                      x1="4"
                      y1="4"
                      x2="14"
                      y2="14"
                      className={styles.cross}
                    />
                    <line
                      x1="14"
                      y1="4"
                      x2="4"
                      y2="14"
                      className={styles.cross}
                    />
                  </svg>
                )}
              </div>
              <div className={styles.fileInputButton}>
                <input
                  type="file"
                  id="fileInput"
                  onChange={handleFileChange}
                  className={styles.hiddenFileInput}
                  accept=".docx"
                />
                <label htmlFor="fileInput" className={styles.customFileButton}>
                  Выбрать
                </label>
              </div>
            </div>

            {showImportFileErrorNotification && (
              <div className={styles.errorMessage}>
                {showImportFileErrorNotification}
              </div>
            )}
          </div>
          <div className={styles.buttomcontainer}>
            <MyButton
              type="button"
              onClick={handleStartImport}
              disabled={!importFile}
            >
              {"Запустить процесс импорта"}
            </MyButton>
          </div>
        </>
      )}

      {isLoadingWizard && (
        <div className={styles.loadingContainer}>
          <IsLoadingParsing />
          <p>Подождите, происходит магия...</p>
        </div>
      )}

      <MyModal visible={modalInstrukt} setVisible={setModalInstrukt}>
        <ModalParsingInstrukt setVisible={setModalInstrukt} />
      </MyModal>

      <MyModal visible={modalInstrukt2} setVisible={setModalInstrukt2}>
        <ModalImportInstrukt setVisible={setModalInstrukt2} />
      </MyModal>

      <NotificationWarning
        message="Некорректная ссылка. Проверьте формат ссылки."
        show={showNotificationError}
      />

      <NotificationError
        message="Упс! Возникла ошибка при импорте!"
        show={showImportErrorNotification}
      />

      {showImportFileErrorNotification && (
        <NotificationWarning message="Некорректный файл, читайте инструкцию!" />
      )}
    </div>
  );
};

export default ParsingPart;
