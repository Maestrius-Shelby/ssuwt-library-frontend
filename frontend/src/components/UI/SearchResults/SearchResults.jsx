import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import styles from "./SearchResults.module.css";
import { useSelector, useDispatch } from "react-redux";
import {
  downloadFile,
  setSearchResults,
} from "../../../ReduxStore/reducers/dataSlice";
import IsLoading from "../IsLoading/IsLoading";

const SearchResults = ({
  filters,
  onFilterResultsChange,
  isOverlayActive,
  isDepartmentOverlayActive,
}) => {
  const dispatch = useDispatch();
  const searchResults = useSelector((state) => state.data.searchResults);
  const isLoading = useSelector((state) => state.data.isLoading);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredResults, setFilteredResults] = useState([]);
  const resultsPerPage = 10;
  const resultsHeadingRef = useRef(null);
  const scrollRef = useRef(null);
  const location = useLocation();

  const handleDownload = async (fileUrl) => {
    if (!fileUrl) {
      console.error("Файл не передан в handleDownload");
      return;
    }

    try {
      const resultAction = await dispatch(downloadFile(fileUrl));
      if (downloadFile.fulfilled.match(resultAction)) {
        const blobUrl = resultAction.payload;

        const fileNameEncoded = fileUrl.split("/").pop();
        const fileName = decodeURIComponent(fileNameEncoded);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = fileName; // теперь имя файла будет читаемым
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Ошибка скачивания файла");
      }
    } catch (error) {
      console.error("Ошибка в handleDownload:", error);
    }
  };

  // Загрузка данных из localStorage, если они там есть
  useEffect(() => {
    // Загрузка данных из localStorage, если они там есть
    const storedResults = localStorage.getItem("searchResults");
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        if (Array.isArray(parsedResults)) {
          dispatch(setSearchResults(parsedResults));
        } else {
          console.error("Invalid data format in localStorage");
        }
      } catch (e) {
        console.error("Failed to parse searchResults from localStorage", e);
      }
    }

    // Скролл к результатам, если это указано в state
    if (
      location.state?.scrollToResults &&
      resultsHeadingRef.current &&
      !isLoading
    ) {
      resultsHeadingRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [dispatch, location.state, isLoading]);

  useEffect(() => {
    // Прокручиваем к результатам поиска, если есть фильтры
    if (location.state?.scrollToResults && resultsHeadingRef.current) {
      resultsHeadingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentPage]);

  // Обработчик фильтров
  const applyFilters = useCallback(
    (filters) => {
      if (Object.keys(filters).length === 0) {
        // Если фильтры пустые, возвращаем полный список
        return searchResults;
      }
      const filteredResults = searchResults.filter((material) => {
        const { start = "", end = "" } = filters.yearRange || {};
        const yearMatch =
          (!start || material.publication_year >= start) &&
          (!end || material.publication_year <= end);

        const authors = material.authors || [];
        const scientificSupervisors = Array.isArray(
          material.scientific_supervisors
        )
          ? material.scientific_supervisors
          : [];

        const participants = [...authors, ...scientificSupervisors];

        // Использование Set для фильтрации уникальных участников
        const uniqueParticipantsMap = new Map();
        const uniqueParticipants = [];

        participants.forEach((participant) => {
          const key = `${participant.human.id}-${participant.relationship_type}`;
          if (!uniqueParticipantsMap.has(key)) {
            uniqueParticipantsMap.set(key, true);
            uniqueParticipants.push(participant);
          }
        });

        // Фильтрация по количеству уникальных участников
        const participantCountMatch =
          !filters.participantCount ||
          uniqueParticipants.length === Number(filters.participantCount);

        // Логика фильтрации по ролям
        let roleMatch = true;

        if (filters.role === "author") {
          // Проверяем, что есть хотя бы один автор, и нет научных руководителей
          roleMatch =
            uniqueParticipants.some(
              (participant) => participant.relationship_type === "Автор"
            ) &&
            !uniqueParticipants.some(
              (participant) =>
                participant.relationship_type === "Научный руководитель"
            );
        } else if (filters.role === "supervisor") {
          // Проверяем, что есть хотя бы один научный руководитель
          roleMatch = uniqueParticipants.some(
            (participant) =>
              participant.relationship_type === "Научный руководитель"
          );
        } else if (filters.role === "author_with_supervisor") {
          // Проверяем наличие и авторов, и научных руководителей
          const hasAuthor = uniqueParticipants.some(
            (participant) => participant.relationship_type === "Автор"
          );
          const hasSupervisor = uniqueParticipants.some(
            (participant) =>
              participant.relationship_type === "Научный руководитель"
          );
          roleMatch = hasAuthor && hasSupervisor;
        }

        return yearMatch && participantCountMatch && roleMatch;
      });

      // Сортировка по году публикации
      let sortedResults = [...filteredResults]; // Копируем массив для сортировки

      if (filters.publicationYearSort) {
        const sortOrder = filters.publicationYearSort === "asc" ? 1 : -1;
        sortedResults.sort(
          (a, b) => (a.publication_year - b.publication_year) * sortOrder
        );
      }

      // Сортировка по алфавиту
      if (filters.alphabetSort) {
        const sortOrder = filters.alphabetSort === "asc" ? 1 : -1;
        sortedResults.sort(
          (a, b) => a.title.localeCompare(b.title) * sortOrder
        );
      }

      return sortedResults;
    },
    [searchResults]
  );

  // Применение фильтров
  useEffect(() => {
    const filtered = applyFilters(filters);
    setFilteredResults(filtered);

    // Отправляем отфильтрованные результаты в родительский компонент
    if (onFilterResultsChange) {
      onFilterResultsChange(filtered);
    }
  }, [filters, searchResults, applyFilters, onFilterResultsChange]);

  const indexOfLastResult = currentPage * resultsPerPage;
  const indexOfFirstResult = indexOfLastResult - resultsPerPage;
  const currentResults = filteredResults.slice(
    indexOfFirstResult,
    indexOfLastResult
  );

  const totalPages = Math.ceil(filteredResults.length / resultsPerPage);

  // Переход к первой странице при изменении searchResults
  useEffect(() => {
    if (searchResults) {
      setCurrentPage(1);
    }
  }, [searchResults]);

  // Сброс текущей страницы на первую при изменении фильтров или количества отфильтрованных результатов
  useEffect(() => {
    if (filteredResults.length === 0 || currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [filteredResults, totalPages, currentPage]);

  // Функция для получения отображаемых страниц
  const getDisplayedPages = () => {
    const visiblePages = 5;
    const boundaryPages = 2;

    if (totalPages <= visiblePages + boundaryPages * 2) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [];
    for (let i = 1; i <= boundaryPages; i++) {
      pages.push(i);
    }

    if (currentPage > boundaryPages + 2) {
      pages.push("...");
    }

    const startPage = Math.max(boundaryPages + 1, currentPage - 1);
    const endPage = Math.min(totalPages - boundaryPages, currentPage + 1);
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - boundaryPages - 1) {
      pages.push("...");
    }

    for (let i = totalPages - boundaryPages + 1; i <= totalPages; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Пагинация
  const paginate = (pageNumber) => {
    if (pageNumber === "...") return;
    setCurrentPage(pageNumber);
  };

  function capitalizeSentence(text) {    
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase(); 
  }

  return (
    <div className={styles.container}>
      <div className={styles.titleresult}>
        <h1 id="results-heading" ref={resultsHeadingRef}>
          Результаты поиска
        </h1>
      </div>

      <div
        className={`${styles.results} ${
          isDepartmentOverlayActive || isOverlayActive
            ? "highlight"
            : "highlightExit"
        }`}
      >
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <IsLoading />
          </div>
        ) : filteredResults.length > 0 ? (
          <>
            {currentResults.map((material, index) => (
              <div key={index} className={styles.resultItem}>
                <span className={styles.title}>
                  {capitalizeSentence(material.title)}
                  <span className={styles.year}>
                    {" "}
                    / {material.publication_year} г.
                  </span>
                </span>

                {material.authors && material.authors.length > 0 && (
                  <span className={styles.author}>
                    {material.authors.map((author, idx) => (
                      <span key={idx}>
                        {author.human.fio} ({author.relationship_type})
                        {idx < material.authors.length - 1 ? " , " : ""}
                      </span>
                    ))}
                  </span>
                )}

                <span className={styles.details}>
                  {material.publication_type} / {material.rating} /{" "}
                  {material.theme} / Издатель: {capitalizeSentence(material.journal_publisher)} /{" "}
                  {material.count_of_pages} стр. /{" "}
                  {material.department.institute} / {material.department.name}
                </span>

                {material.attached_file && (
                  <div className={styles.buttomContainer}>
                    <button
                      className={styles.downloadLink}
                      onClick={() => handleDownload(material.attached_file)} // передаём путь файла
                    >
                      Скачать
                    </button>
                  </div>
                )}
              </div>
            ))}
            <div
              ref={scrollRef}
              style={{ height: "1px", visibility: "hidden" }}
            ></div>
          </>
        ) : (
          <p className={styles.noResults}>Нет результатов поиска</p>
        )}
      </div>

      {!isLoading && filteredResults.length > 0 && (
        <div className={styles.pagination}>
          {getDisplayedPages().map((page, index) => (
            <button
              key={index}
              onClick={() => paginate(page)}
              className={`${styles.pageButton} ${
                currentPage === page ? styles.active : ""
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
