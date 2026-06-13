import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchVerifiedWorks,
  verifyDownloadFile,
} from "../../../ReduxStore/reducers/verifySlice";
import {
  makeSelectVerifiedWorks,
  makeSelectVerifyLoading,
} from "../../../ReduxStore/selectors/verifySelectors";
import styles from "./VerifyList.module.css";
import VerifyService from "../../../API/VerifyService";
import MyButton from "../button/MyButton";
import NotificationSuccess from "../NotificationSuccess/NotificationSuccess";
import NotificationError from "../NotificationError/NotificationError";
import CheckboxParsing from "../CheckboxParsing/CheckboxParsing";
import ModalComment from "../ModalComment/ModalComment";
import MyModalComment from "../MyModalComment/MyModalComment";
import IsLoading from "../IsLoading/IsLoading";

const ratingMap = {
  1: "ВАК",
  2: "РИНЦ",
  3: "Зарубежное",
  4: "Elibrary",
  5: "Внутреннее (Отчеты, методички и тд)",
};

const VerifyList = () => {
  const dispatch = useDispatch();
  const verifiedWorks = useSelector(makeSelectVerifiedWorks);
  const isLoading = useSelector(makeSelectVerifyLoading);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [showNotificationError, setShowNotificationError] = useState(false);
  const resultsPerPage = 15;
  const [modalComment, setModalComment] = useState(false);

  useEffect(() => {
    dispatch(fetchVerifiedWorks());
  }, [dispatch]);

  const handleVerifyDownload = async (fileUrl) => {
    if (!fileUrl) {
      console.error("Файл не передан в handleDownload");
      return;
    }

    try {
      const resultAction = await dispatch(verifyDownloadFile(fileUrl));
      if (verifyDownloadFile.fulfilled.match(resultAction)) {
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

  const indexOfLastWork = currentPage * resultsPerPage;
  const indexOfFirstWork = indexOfLastWork - resultsPerPage;
  const currentWorks = verifiedWorks.slice(indexOfFirstWork, indexOfLastWork);

  const totalPages = Math.ceil(verifiedWorks.length / resultsPerPage);

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

  const handleCheckboxChange = (workId) => {
    setSelectedWorks((prevSelected) =>
      prevSelected.includes(workId)
        ? prevSelected.filter((id) => id !== workId)
        : [...prevSelected, workId]
    );
  };

  const handleVerify = async () => {
    try {
      await VerifyService.verifyWorks(selectedWorks);
      setShowNotificationSuccess(true);
      setSelectedWorks([]);
      setTimeout(() => setShowNotificationSuccess(false), 3000);
      dispatch(fetchVerifiedWorks()); // Обновляем данные после успешной верификации
    } catch (error) {
      console.error("Ошибка при верификации работ:", error);
      setShowNotificationError(true);
      setTimeout(() => setShowNotificationError(false), 3000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.toptext}>
        <h1>Верификация работ</h1>
        <p>
          В данном разделе проверяются работы, отправленные пользователями. При
          необходимости имеется возможность оставления комментария автору. После
          успешной верификации работа будет доступна для общего просмотра в
          списке опубликованных.
        </p>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Автор</th>
              <th className={styles.tablecenter}>Научный руководитель</th>
              <th className={styles.tablecenter}>Тема</th>
              <th>Издатель</th>
              <th>Год</th>
              <th className={styles.tablecenter}>Кол-во страниц</th>
              <th className={styles.tablecenter}>Рейтинг</th>
              <th className={styles.tablecenter}>Файл</th>
              <th className={styles.tablecenter}>Выбор</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="10" className={styles.loadingContainer}>
                  <IsLoading />
                </td>
              </tr>
            ) : currentWorks.length > 0 ? (
              currentWorks.map((work, index) => (
                <tr key={`${work.id}-${index}`}>
                  <td>{capitalizeSentence(work.title)}</td>
                  <td>
                    {work.authors.length > 0 ? work.authors.join(", ") : "——"}
                  </td>
                  <td className={styles.tablecenter}>
                    {work.supervisors.length > 0
                      ? work.supervisors.join(", ")
                      : "——"}
                  </td>
                  <td>{work.theme}</td>
                  <td>{capitalizeSentence(work.journal_publisher)}</td>
                  <td>{work.publication_year}</td>
                  <td className={styles.tablecenter}>{work.count_of_pages}</td>
                  <td className={styles.tablecenter}>
                    {ratingMap[work.rating] || "——"}
                  </td>
                  <td className={styles.tablecenter}>
                    {work.attached_file ? (
                      <button
                        className={styles.fileLink}
                        onClick={() => handleVerifyDownload(work.attached_file)}
                      >
                        Скачать
                      </button>
                    ) : (
                      "——"
                    )}
                  </td>

                  <td className={styles.tablecenter}>
                    <CheckboxParsing
                      checked={selectedWorks.includes(work.id)}
                      onChange={() => handleCheckboxChange(work.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className={styles.noData}>
                  Данные отсутствуют
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
      <div className={styles.verifyButtonContainer}>
        <MyButton onClick={handleVerify} disabled={selectedWorks.length === 0}>
          Верифицировать
        </MyButton>
      </div>
      <NotificationSuccess
        message="Работа верифицирована"
        show={showNotificationSuccess}
      />
      <NotificationError
        message="Верификация не выполнена"
        show={showNotificationError}
      />
      <MyModalComment visible={modalComment} setVisible={setModalComment}>
        <ModalComment />
      </MyModalComment>
    </div>
  );
};

export default VerifyList;
