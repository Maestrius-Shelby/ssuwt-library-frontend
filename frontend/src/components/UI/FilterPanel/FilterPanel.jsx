import React, { useState, useEffect } from "react";
import styles from "./FilterPanel.module.css";
import MyButton from "../button/MyButton";
import NotificationWarning from "../NotificationWarning/NotificationWarning";

const FilterPanel = ({
  onFilterChange,
  resetFilters: shouldResetFilters,
  onResetComplete,
  filters,
  setFilters,
  isOverlayActive,
  isDepartmentOverlayActive,
  setIsYearRangeApplied,
  setIsFiltersApplied,
  isFiltersApplied,
}) => {
  const [participantCount, setParticipantCount] = useState(
    filters.participantCount
  );
  const [role, setRole] = useState(filters.role);
  const [yearRange, setYearRange] = useState(filters.yearRange);
  const [alphabetSort, setAlphabetSort] = useState(filters.alphabetSort);
  const [publicationYearSort, setPublicationYearSort] = useState(
    filters.publicationYearSort
  );
  const [showNotificationWarning, setShowNotificationWarning] = useState(false);
  const [prevYearRange, setPrevYearRange] = useState(filters.yearRange);

  useEffect(() => {
    if (shouldResetFilters) {
      setParticipantCount("");
      setRole("");
      setYearRange({ start: "", end: "" });
      setAlphabetSort("");
      setPublicationYearSort("");
      onFilterChange({
        participantCount: "",
        role: "",
        yearRange: { start: "", end: "" },
        alphabetSort: "",
        publicationYearSort: "",
      });
      onResetComplete(); // Уведомляем родителя, что сброс завершен
      setIsFiltersApplied(false);
    }
  }, [
    shouldResetFilters,
    onResetComplete,
    onFilterChange,
    setIsFiltersApplied,
  ]);

  useEffect(() => {
    setParticipantCount(filters.participantCount);
    setRole(filters.role);
    setYearRange(filters.yearRange);
    setAlphabetSort(filters.alphabetSort);
    setPublicationYearSort(filters.publicationYearSort);
  }, [filters]);

  useEffect(() => {
    if (
      yearRange.start !== prevYearRange.start ||
      yearRange.end !== prevYearRange.end
    ) {
      setIsFiltersApplied(false);
      setPrevYearRange(yearRange);
    }
  }, [yearRange, prevYearRange, setIsFiltersApplied]);

  const isAnyFilterApplied = () => {
    return (
      participantCount ||
      role ||
      yearRange.start ||
      yearRange.end ||
      alphabetSort ||
      publicationYearSort
    );
  };

  const scrollToResults = () => {
    const resultsHeading = document.getElementById("results-heading");
    if (resultsHeading) {
      resultsHeading.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    setIsYearRangeApplied(!!filters.yearRange.start || !!filters.yearRange.end); // Обновляем состояние
  }, [filters.yearRange, setIsYearRangeApplied]);

  const handleFilterChange = () => {
    if (!isAnyFilterApplied()) {
      setShowNotificationWarning(true); // Показываем уведомление, если фильтры не выбраны
      setTimeout(() => setShowNotificationWarning(false), 3000); // Скрываем уведомление через 3 секунды
      return;
    }

    onFilterChange({
      participantCount,
      role,
      yearRange,
      alphabetSort,
      publicationYearSort,
    });

    setIsFiltersApplied(true);

    if (isAnyFilterApplied()) {
      // Прокрутка к заголовку "Результаты поиска"
      scrollToResults();
    }
  };

  const resetFilters = () => {
    setParticipantCount("");
    setRole("");
    setYearRange({ start: "", end: "" });
    setAlphabetSort("");
    setPublicationYearSort("");

    onFilterChange({
      participantCount: "",
      role: "",
      yearRange: { start: "", end: "" },
      alphabetSort: "",
      publicationYearSort: "",
    });
    setIsFiltersApplied(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Фильтры</h2>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Количество участников</label>
        <input
          type="number"
          value={participantCount}
          onChange={(e) =>
            setFilters({
              ...filters,
              participantCount:
                e.target.value === "" ? "" : Number(e.target.value),
            })
          }
          placeholder="Введите количество"
          className={styles.input}
        />
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Роль в работе</label>
        <select
          className={styles.select}
          value={role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">Все</option>
          <option value="author">Только авторы</option>
          <option value="supervisor">Только с научным руководителем</option>
        </select>
      </div>

      <div
        className={`${styles.filterGroup} ${
          isOverlayActive || isDepartmentOverlayActive
            ? yearRange.start || yearRange.end
              ? "highlight-green"
              : "highlight-red"
            : "highlightExit"
        }`}
      >
        <label className={styles.label}>Год публикации в диапазоне</label>
        <div className={styles.yearInputs}>
          <input
            type="number"
            placeholder="С"
            className={styles.input}
            value={yearRange.start}
            onChange={(e) =>
              setFilters({
                ...filters,
                yearRange: { ...yearRange, start: e.target.value },
              })
            }
          />
          <input
            type="number"
            placeholder="По"
            className={styles.input}
            value={yearRange.end}
            onChange={(e) =>
              setFilters({
                ...filters,
                yearRange: { ...yearRange, end: e.target.value },
              })
            }
          />
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>Сортировка по году публикации</label>
        <select
          className={styles.select}
          value={publicationYearSort}
          onChange={(e) =>
            setFilters({ ...filters, publicationYearSort: e.target.value })
          }
        >
          <option value="">Нет</option>
          <option value="asc">По возрастанию</option>
          <option value="desc">По убыванию</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label className={styles.label}>
          Сортировка публикаций по алфавиту
        </label>
        <select
          className={styles.select}
          value={alphabetSort}
          onChange={(e) =>
            setFilters({ ...filters, alphabetSort: e.target.value })
          }
        >
          <option value="">Нет</option>
          <option value="asc">А-Я</option>
          <option value="desc">Я-А</option>
        </select>
      </div>

      <div
        className={`${styles.buttomconteiner} ${
          isOverlayActive || isDepartmentOverlayActive
            ? isFiltersApplied
              ? "highlight-green"
              : "highlight-red"
            : "highlightExit"
        }`}
      >
        <MyButton onClick={handleFilterChange}>Применить фильтры</MyButton>

        <button
          className={`${styles.resetButton}`}
          onClick={resetFilters}
          disabled={!isAnyFilterApplied()}
        >
          Сбросить фильтры
        </button>
      </div>

      <NotificationWarning
        message="Укажите или выберите хотя бы один фильтр."
        show={showNotificationWarning}
      />
    </div>
  );
};

export default FilterPanel;
