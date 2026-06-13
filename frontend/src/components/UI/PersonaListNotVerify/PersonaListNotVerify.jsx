import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchScientificMaterialsForPerson } from "../../../ReduxStore/reducers/personalSlice";
import {
  selectPendingMaterials,
  selectPersonalLoading,
} from "../../../ReduxStore/selectors/personalSelectors";
import styles from "./PersonaListNotVerify.module.css";
import IsLoading from "../IsLoading/IsLoading";

const PersonaListNotVerify = () => {
  const dispatch = useDispatch();
  const pendingMaterials = useSelector(selectPendingMaterials);
  const isLoading = useSelector(selectPersonalLoading);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  useEffect(() => {
    dispatch(fetchScientificMaterialsForPerson());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchScientificMaterialsForPerson()).then(() => {
      setInitialLoading(false); // Отключаем только после завершения первой загрузки
    });
  }, [dispatch]);

  // Пагинация
  const indexOfLastMaterial = currentPage * resultsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - resultsPerPage;
  const currentMaterials = pendingMaterials.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );
  const totalPages = Math.ceil(pendingMaterials.length / resultsPerPage);

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
      <div className={styles.toptext}>
        <h1>Неопубликованные работы</h1>
        <p>
          В данном разделе находятся работы, которые не верифицированы и
          недоступны в общем поиске.
        </p>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form}>
          <div className={styles.results}>
            {(isLoading || initialLoading) && (
              <div className={styles.loadingContainer}>
                <IsLoading />
              </div>
            )}

            {!isLoading &&
              !initialLoading &&
              currentMaterials.length > 0 &&
              currentMaterials.map((material) => (
                <div key={material.id} className={styles.resultItem}>
                  <span className={styles.title}>
                    {capitalizeSentence(material.title)}
                    <span className={styles.year}>
                      {" "}
                      / {material.publication_year} г.
                    </span>
                  </span>
                  <span className={styles.details}>
                    {material.publication_type} / {material.rating} /{" "}
                    {material.theme} / Издатель: {capitalizeSentence(material.journal_publisher)} /{" "}
                    {material.count_of_pages} стр. /{" "}
                    {material.department.institute} / {material.department.name}
                  </span>
                </div>
              ))}

            {!isLoading && !initialLoading && currentMaterials.length === 0 && (
              <p className={styles.noResults}>Нет материалов на верификацию</p>
            )}
          </div>
        </form>
      </div>

      {/* Пагинация */}
      {!isLoading && !initialLoading && totalPages > 1 && (
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

export default PersonaListNotVerify;
