import React, { useState, useRef, useEffect } from "react";
import { CSSTransition } from "react-transition-group";
import styles from "./ExportOptions.module.css";
import MyButton from "../button/MyButton";
import { useDispatch } from "react-redux";
import {
  getExportDepartment,
  getExportForm16Surname,
  getExportList,
} from "../../../ReduxStore/reducers/exportSlice";
import NotificationError from "../NotificationError/NotificationError";
import NotificationSuccess from "../NotificationSuccess/NotificationSuccess";

const ExportOptions = ({
  filteredResults,
  setIsOverlayActive,
  setIsDepartmentOverlayActive,
  isOverlayActive,
  isDepartmentOverlayActive,
  resetFilters,
  handleClear,
  isCriteriaMet,
  isDepartmentCriteriaMet,
  author_fio,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const [isSurnameMenuOpen, setIsSurnameMenuOpen] = useState(false);
  const [isDepartmentMenuOpen, setIsDepartmentMenuOpen] = useState(false);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [showNotificationError, setShowNotificationError] = useState(false);
  const isExportButtonDisabled = !isCriteriaMet;
  const isExportDepartmentButtonDisabled = !isDepartmentCriteriaMet;

  const dropdownRef = useRef(null);
  const listDropdownRef = useRef(null);
  const surnameDropdownRef = useRef(null);
  const departmentDropdownRef = useRef(null);
  const dispatch = useDispatch();

  const handleExportList = () => {
    if (!filteredResults || filteredResults.length === 0) {
      setShowNotificationError(true);
      setTimeout(() => setShowNotificationError(false), 3000);
      return;
    }

    dispatch(getExportList(filteredResults))
      .unwrap()
      .then((url) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = "Отчет по результатам поиска.docx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowNotificationSuccess(true);
        setTimeout(() => setShowNotificationSuccess(false), 3000);
      })
      .catch(() => {
        setShowNotificationError(true);
        setTimeout(() => setShowNotificationError(false), 3000);
      });
  };

  const handleExportForm16Surname = () => {
    if (!filteredResults || filteredResults.length === 0) {
      setShowNotificationError(true);
      setTimeout(() => setShowNotificationError(false), 3000);
      return;
    }

    const resultsWithoutAuthorFio = filteredResults.map(
      ({ author_fio, ...rest }) => rest
    );

    const filteredResultsForm16Surname = {
      results: resultsWithoutAuthorFio,
      author_fio: author_fio,
    };

    dispatch(getExportForm16Surname(filteredResultsForm16Surname))
      .unwrap()
      .then((url) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = "Форма_16_по_фамилии.docx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowNotificationSuccess(true);
        setTimeout(() => setShowNotificationSuccess(false), 3000);
      })
      .catch(() => {
        setShowNotificationError(true);
        setTimeout(() => setShowNotificationError(false), 3000);
      });
  };

  const handleExportDepartment = () => {
    if (!filteredResults || filteredResults.length === 0) {
      setShowNotificationError(true);
      setTimeout(() => setShowNotificationError(false), 3000);
      return;
    }

    dispatch(getExportDepartment(filteredResults))
      .unwrap()
      .then((url) => {
        const link = document.createElement("a");
        link.href = url;
        link.download = "Отчет_по_форме_16_Кафедра.docx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setShowNotificationSuccess(true);
        setTimeout(() => setShowNotificationSuccess(false), 3000);
      })
      .catch(() => {
        setShowNotificationError(true);
        setTimeout(() => setShowNotificationError(false), 3000);
      });
  };

  const toggleMenuForm16 = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleListMenu = () => {
    setIsListMenuOpen(!isListMenuOpen);
  };

  const toggleSurnameMenu = () => {
    setIsSurnameMenuOpen(!isSurnameMenuOpen);
  };

  const toggleDepartmentMenu = () => {
    setIsDepartmentMenuOpen(!isDepartmentMenuOpen);
  };

  const scrollToSearchCriteria = () => {
    const element = document.getElementById("search-criteria");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleOverlay = () => {
    setIsOverlayActive((prev) => !prev);
    resetFilters();
    if (typeof handleClear === "function") {
      handleClear();
    }
    toggleSurnameMenu();
    scrollToSearchCriteria();
  };

  const toggleDepartmentOverlay = () => {
    setIsDepartmentOverlayActive((prev) => !prev);
    resetFilters();
    if (typeof handleClear === "function") {
      handleClear();
    }
    toggleDepartmentMenu();
    scrollToSearchCriteria();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (isOverlayActive) {
          setIsOverlayActive(false);
          setIsSurnameMenuOpen(false);
        }
        if (isDepartmentOverlayActive) {
          setIsDepartmentOverlayActive(false);
          setIsDepartmentMenuOpen(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isOverlayActive,
    isDepartmentOverlayActive,
    setIsOverlayActive,
    setIsDepartmentOverlayActive,
  ]);

  return (
    <div
      className={`${styles.container} ${
        isListMenuOpen && isMenuOpen && isSurnameMenuOpen
          ? styles.expandedAll
          : isListMenuOpen && isMenuOpen
          ? styles.expandedListForm16
          : isListMenuOpen && isSurnameMenuOpen
          ? styles.expandedListSurname
          : isMenuOpen && isSurnameMenuOpen
          ? styles.expandedForm16Surname
          : isListMenuOpen
          ? styles.expandedList
          : isMenuOpen
          ? styles.expandedForm16
          : isSurnameMenuOpen
          ? styles.expandedSurname
          : styles.collapsed
      }`}
    >
      <h2 className={styles.title}>Формат экспорта</h2>
      <div className={styles.buttomconteiner}>
        <div className={styles.filterGroup}>
          <MyButton onClick={toggleListMenu} data-active={isListMenuOpen}>
            Списком
          </MyButton>
          <CSSTransition
            in={isListMenuOpen}
            timeout={400}
            classNames={{
              enter: styles.dropdownEnter,
              enterActive: styles.dropdownEnterActive,
              exit: styles.dropdownExit,
              exitActive: styles.dropdownExitActive,
            }}
            unmountOnExit
            nodeRef={listDropdownRef}
          >
            <div ref={listDropdownRef} className={styles.dropdownMenu}>
              <MyButton onClick={handleExportList}>Создать документ!</MyButton>
            </div>
          </CSSTransition>
        </div>

        <div className={styles.filterGroup}>
          <MyButton onClick={toggleMenuForm16} data-active={isMenuOpen}>
            Форма №16
          </MyButton>
          <CSSTransition
            in={isMenuOpen}
            timeout={400}
            classNames={{
              enter: styles.dropdownEnter,
              enterActive: styles.dropdownEnterActive,
              exit: styles.dropdownExit,
              exitActive: styles.dropdownExitActive,
            }}
            unmountOnExit
            nodeRef={dropdownRef}
          >
            <div ref={dropdownRef} className={styles.dropdownMenu}>
              <div
                className={`${styles.filterGroupForm16} ${
                  isOverlayActive ? "highlight" : "highlightExit"
                }`}
              >
                <MyButton type="button" onClick={toggleOverlay}>
                  По фамилии
                </MyButton>
                <CSSTransition
                  in={isSurnameMenuOpen}
                  timeout={400}
                  classNames={{
                    enter: styles.dropdownEnter,
                    enterActive: styles.dropdownEnterActive,
                    exit: styles.dropdownExit,
                    exitActive: styles.dropdownExitActive,
                  }}
                  unmountOnExit
                  nodeRef={surnameDropdownRef}
                >
                  <div ref={surnameDropdownRef} className={styles.dropdownMenu}>
                    <div
                      className={
                        !isExportButtonDisabled ? "activeButtonWrapper" : ""
                      }
                    >
                      <MyButton
                        disabled={isExportButtonDisabled}
                        onClick={handleExportForm16Surname}
                      >
                        Создать документ!
                      </MyButton>
                    </div>
                  </div>
                </CSSTransition>
              </div>

              <div
                className={`${styles.filterGroupDepartment} ${
                  isDepartmentOverlayActive ? "highlight" : "highlightExit"
                }`}
              >
                <MyButton type="button" onClick={toggleDepartmentOverlay}>
                  По кафедре
                </MyButton>
                <CSSTransition
                  in={isDepartmentMenuOpen}
                  timeout={400}
                  classNames={{
                    enter: styles.dropdownEnter,
                    enterActive: styles.dropdownEnterActive,
                    exit: styles.dropdownExit,
                    exitActive: styles.dropdownExitActive,
                  }}
                  unmountOnExit
                  nodeRef={departmentDropdownRef}
                >
                  <div
                    ref={departmentDropdownRef}
                    className={styles.dropdownMenu}
                  >
                    <div
                      className={
                        !isExportDepartmentButtonDisabled
                          ? "activeButtonWrapper"
                          : ""
                      }
                    >
                      <MyButton
                        disabled={isExportDepartmentButtonDisabled}
                        onClick={handleExportDepartment}
                      >
                        Создать документ!
                      </MyButton>
                    </div>
                  </div>
                </CSSTransition>
              </div>
            </div>
          </CSSTransition>
        </div>
      </div>
      <>
        <NotificationError
          message="Нет данных для экспорта или ошибка сервера."
          show={showNotificationError}
        />

        <NotificationSuccess
          message="Файл успешно скачан!"
          show={showNotificationSuccess}
        />
      </>
    </div>
  );
};

export default ExportOptions;
