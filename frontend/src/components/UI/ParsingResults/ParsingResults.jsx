import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./ParsingResults.module.css";
import {
  selectParsingData,
  selectParsingError,
} from "../../../ReduxStore/selectors/parsingSelectors";
import { fetchInitialData } from "../../../ReduxStore/reducers/dataSlice";
import { makeSelectData } from "../../../ReduxStore/selectors/dataSelectors";
import { addScientificMaterialAsync } from "../../../ReduxStore/reducers/parsingSlice";
import CheckboxParsing from "../CheckboxParsing/CheckboxParsing";
import DeleteButton from "../buttondelete/DeleteButton";
import MyButton from "../button/MyButton";
import NotificationSuccess from "../NotificationSuccess/NotificationSuccess";
import NotificationDelete from "../NotificationDelete/NotificationDelete";

const ParsingResults = () => {
  const parsingData = useSelector(selectParsingData);
  const parsingError = useSelector(selectParsingError);
  const [parsedInputs, setParsedInputs] = useState([]);
  const [selectedWorks, setSelectedWorks] = useState([]);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [showNotificationDelete, setShowNotificationDelete] = useState(false);
  const [errors, setErrors] = useState({});
  const topRef = useRef(null);
  const workRefs = useRef([]); 

  const { relationshipData: relationshipTypeList } = useSelector(
    (state) => state.data
  );

  const { institutesList, departmentList, ratingList } =
    useSelector(makeSelectData);

  const dispatch = useDispatch();

  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 3;

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  const indexOfLastMaterial = currentPage * resultsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - resultsPerPage;
  const currentParsedInputs = parsedInputs.slice(
    indexOfFirstMaterial,
    indexOfLastMaterial
  );
  const totalPages = Math.ceil(parsedInputs.length / resultsPerPage);

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
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const validateWork = (work, index) => {
    const errors = {};

    const requiredFields = ["title", "publicationYear", "publisher"];

    if (!selectedWorks.includes(index)) {
      return errors;
    }

    requiredFields.forEach((field) => {
      if (!work[field]) {
        errors[field] = "Заполните поле";
      }
    });

    const optionalFields = [
      { field: "rating", message: "Выберите один из пунктов списка" },
      { field: "institutes", message: "Выберите один из пунктов списка" },
      { field: "department", message: "Выберите один из пунктов списка" },
    ];

    optionalFields.forEach(({ field, message }) => {
      if (!work[field]) {
        errors[field] = message;
      }
    });

    return errors;
  };

  const validateAllWorks = () => {
    const newErrors = {};
    let firstErrorIndex = null;
    let errorPage = null;  

    selectedWorks.forEach((index) => {
    const workErrors = validateWork(parsedInputs[index], index);
    if (Object.keys(workErrors).length > 0) {
      newErrors[index] = workErrors;
       if (firstErrorIndex === null) {
        firstErrorIndex = index;
        // Вычисляем страницу с ошибкой
        errorPage = Math.ceil((index + 1) / resultsPerPage); 
      }
    }
  });


    setErrors(newErrors);

    return { 
    isValid: Object.keys(newErrors).length === 0,
    firstErrorIndex, 
    errorPage // Возвращаем страницу с ошибкой
    };
  };

  useEffect(() => {
    if (parsedInputs.length > 0) {
      const updatedInputs = parsedInputs.map((input) => {
        if (input.institutes) {
          const selectedInstituteName = institutesList.find(
            (institute) => institute.id === parseInt(input.institutes, 10)
          )?.name;

          if (selectedInstituteName) {
            const filtered = departmentList.filter(
              (department) => department.institute === selectedInstituteName
            );
            if (
              JSON.stringify(input.filteredDepartments) !==
              JSON.stringify(filtered)
            ) {
              return {
                ...input,
                filteredDepartments: filtered,
              };
            }
          }
        }
        return input;
      });

      if (JSON.stringify(parsedInputs) !== JSON.stringify(updatedInputs)) {
        setParsedInputs(updatedInputs);
      }
    }
  }, [parsedInputs, departmentList, institutesList]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;

    // Ограничение длины текста
    if (name === "title" && value.length > 300) {
      return;
    }
    if (name === "theme" && value.length > 150) {
      return;
    }
    if (name === "publisher" && value.length > 200) {
      return;
    }

    // Ограничение для года публикации (только цифры, максимум 4 символа)
    if (
      name === "publicationYear" &&
      (value.length > 4 || !/^\d*$/.test(value))
    ) {
      return;
    }

    // Ограничение для количества страниц (только цифры и знак "-")
    if (
      name === "pages" &&
      (value.length > 10 || !/^\d{0,4}(-\d{0,4})?$/.test(value))
    ) {
      return;
    }

    setParsedInputs((prevInputs) => {
      const updatedInputs = [...prevInputs];
      updatedInputs[index] = {
        ...updatedInputs[index],
        [name]: value,
        ...(name === "institutes" && { department: "" }),
      };

      if (name === "institutes") {
        const selectedInstituteName = institutesList.find(
          (institute) => institute.id === parseInt(value, 10)
        )?.name;

        if (selectedInstituteName) {
          const filtered = departmentList.filter(
            (department) => department.institute === selectedInstituteName
          );
          updatedInputs[index].filteredDepartments = filtered;
        } else {
          updatedInputs[index].filteredDepartments = [];
        }
      }

      return updatedInputs;
    });
    if (selectedWorks.includes(index)) {
      const newErrors = { ...errors };
      if (newErrors[index]) {
        // Удаляем ошибку для текущего поля, если оно было изменено
        delete newErrors[index][name];

        // Если ошибок больше нет, удаляем запись
        if (Object.keys(newErrors[index]).length === 0) {
          delete newErrors[index];
        }

        setErrors(newErrors);
      }
    }
  };

  useEffect(() => {
    if (parsingData && parsingData.length > 0) {
      const updatedInputs = parsingData.map((data) => ({
        title: data.title || "",
        authors: Array.isArray(data.authors)
          ? data.authors.map((author) => ({
              human: author.human || null,
              fio: author.fio || "",
              relationshipType:
                author.relationshipType ||
                relationshipTypeList.find(
                  (type) => type.id === author.relationship_type
                ) || { id: author.relationship_type, name: "Неизвестно" } ||
                null,
            }))
          : [],
        publicationYear: data.publication_year || null,
        pages: data.count_of_pages || "",
        theme: data.theme || "",
        rating:
          ratingList.find((r) => r.id === data.rating)?.name ||
          data.rating ||
          null,
        publisher: data.journal_publisher || "",
        publicationType: data.publication_type || null,
        instituteId: data.institute_id || null,
        departmentId: data.department_id || null,
        link: data.link || "",
        institutes: data.institute_id || null,
        department: data.department_id || null,
        filteredDepartments: [],
      }));

      setParsedInputs((prevInputs) => {
        return JSON.stringify(prevInputs) !== JSON.stringify(updatedInputs)
          ? updatedInputs
          : prevInputs;
      });
    }
  }, [parsingData, relationshipTypeList, ratingList]);

  const toggleSelection = (index) => {
    setSelectedWorks((prevSelected) =>
      prevSelected.includes(index)
        ? prevSelected.filter((i) => i !== index)
        : [...prevSelected, index]
    );
  };

  const handleRoleChange = (e, inputIndex, authorIndex) => {
    const updatedInputs = [...parsedInputs];
    const selectedType = relationshipTypeList.find(
      (type) => type.id === Number(e.target.value)
    );

    if (selectedType) {
      updatedInputs[inputIndex].authors[authorIndex].relationshipType =
        selectedType;
      setParsedInputs(updatedInputs);
    }
  };

  const handleAdd = async () => {
    const { isValid, firstErrorIndex, errorPage } = validateAllWorks();

    if (!isValid) {
    if (errorPage && errorPage !== currentPage) {
      setCurrentPage(errorPage);
      setTimeout(() => {
        if (workRefs.current[firstErrorIndex]) {
          workRefs.current[firstErrorIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    } 
    else if (firstErrorIndex !== null && workRefs.current[firstErrorIndex]) {
      workRefs.current[firstErrorIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
    return;
  }

    const selectedData = selectedWorks.map((index) => {
      const data = parsingData[index];
      const parsedInput = parsedInputs[index];

      return {
        title: parsedInput.title || "",
        theme: parsedInput.theme || "",
        journal_publisher: parsedInput.publisher || "",
        publication_year: Number(parsedInput.publicationYear) || null,
        count_of_pages: parsedInput.pages || "",
        publication_type: Number(data.publication_type) || null,
        rating:
          ratingList.find((rating) => rating.name === parsedInput.rating)?.id ||
          null,
        authors: parsedInput.authors.map((author) => ({
          human: Number(author.human) || null,
          relationship_type: Number(author.relationshipType?.id) || null,
        })),
        department: parsedInput.department || null,
        institute: parsedInput.institutes || null,
        link: data.link || "",
      };
    });

    try {
      await Promise.all(
        selectedData.map((data) => dispatch(addScientificMaterialAsync(data)))
      );

      // Удаляем добавленные работы
      setParsedInputs((prevInputs) =>
        prevInputs.filter((_, index) => !selectedWorks.includes(index))
      );

      // Очищаем выбранные работы
      setSelectedWorks([]);

      // Показываем уведомление
      setShowNotificationSuccess(true);
      setTimeout(() => setShowNotificationSuccess(false), 3000);

      console.log("Работы успешно добавлены!");
    } catch (error) {
      console.error("Ошибка при добавлении работы:", error);
    }
  };

  const handleDelete = () => {
    const updatedInputs = parsedInputs.filter(
      (_, index) => !selectedWorks.includes(index)
    );
    setParsedInputs(updatedInputs);
    setSelectedWorks([]);

    const updatedLocalStorageData = updatedInputs.map((input) => ({
      title: input.title || "",
      authors: input.authors.map((author) => ({
        human: author.human || null,
        fio: author.fio || "",
        relationship_type: author.relationshipType?.id || null,
      })),
      publication_year: input.publicationYear || null,
      count_of_pages: input.pages || "",
      theme: input.theme || "",
      rating: input.rating || null,
      journal_publisher: input.publisher || "",
      publication_type: input.publicationType || null,
      institute_id: input.instituteId || null,
      department_id: input.departmentId || null,
      link: input.link || "",
    }));
    localStorage.setItem(
      "parsingData",
      JSON.stringify(updatedLocalStorageData)
    );
    setShowNotificationDelete(true);
    setTimeout(() => setShowNotificationDelete(false), 3000);
  };

  useEffect(() => {
  if (workRefs.current.length > 0) {
    
    const errorWorkIndex = selectedWorks.find(index => 
      index >= indexOfFirstMaterial && 
      index < indexOfLastMaterial && 
      errors[index] && 
      Object.keys(errors[index]).length > 0
    );

    if (errorWorkIndex !== undefined && workRefs.current[errorWorkIndex]) {

      workRefs.current[errorWorkIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }
} , [currentPage, errors, selectedWorks, indexOfFirstMaterial, indexOfLastMaterial]);
  
  return (
    <div className={styles.container}>
      <div ref={topRef} className={styles.toptext}>
        <h1>Результаты импорта работ</h1>
        <p>
          На странице представлены данные, полученные в результате импорта с
          научных работ с выбранного ресурса.
        </p>
      </div>

      {parsingError && (
        <div className={styles.error}>Ошибка: {parsingError}</div>
      )}

      {parsedInputs.length > 0 ? (
        <>
          {currentParsedInputs.map((data, index) => {
            const actualIndex = indexOfFirstMaterial + index;
            const isSelected = selectedWorks.includes(actualIndex);

            return (
              <div
                key={actualIndex}
                ref={el => workRefs.current[actualIndex] = el}
                className={`${styles.formContainer} ${isSelected ? styles.selected : ""}`}
              >
                <form className={styles.form}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Ссылка на работу:</label>
                    <div className={styles.linkContainer}>
                      {data.link ? (
                       <a
                          href={data.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.link}
                        > 
                          {data.link}
                        </a>
                      ) : (
                        <span className={styles.missingLink}>Отсутствует</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.formWrapper}>
                    <div className={styles.column}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Название:<span className={styles.required}> *</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={data.title || ""}
                          onChange={(e) => handleChange(e, actualIndex)}
                          className={`${styles.input} ${
                            errors[actualIndex]?.title ? styles.errorInput : ""
                          }`}
                        />
                        {errors[actualIndex]?.title && (
                          <span className={styles.errorMessage}>
                            {errors[actualIndex].title}
                          </span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Участники научного процесса{" "}
                          <span className={styles.required}>*</span>
                        </label>
                        <div className={styles.authorContainer}>
                          {data.authors.map((author, pIndex) => (
                            <div key={pIndex} className={styles.authorEntry}>
                              <input
                                type="text"
                                value={author.fio || ""}
                                disabled
                                className={styles.input}
                              />
                              <div className={styles.inputGroup}>
                                <select
                                  className={`${styles.select} ${
                                    errors[
                                      `relationshipType_${actualIndex}_${pIndex}`
                                    ]
                                      ? styles.error
                                      : ""
                                  }`}
                                  value={author.relationshipType?.id || ""}
                                  onChange={(e) =>
                                    handleRoleChange(e, actualIndex, pIndex)
                                  }
                                >
                                  <option value="">Выбор из списка</option>
                                  {relationshipTypeList.map((type) => (
                                    <option key={type.id} value={type.id}>
                                      {type.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {errors[
                                `relationshipType_${actualIndex}_${pIndex}`
                              ] && (
                                <span className={styles.errorMessageType}>
                                  {
                                    errors[
                                      `relationshipType_${actualIndex}_${pIndex}`
                                    ]
                                  }
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Год публикации:
                          <span className={styles.required}> *</span>
                        </label>
                        <input
                          type="text"
                          name="publicationYear"
                          value={data.publicationYear || ""}
                          onChange={(e) => handleChange(e, actualIndex)}
                          className={`${styles.input} ${
                            errors[actualIndex]?.publicationYear
                              ? styles.errorInput
                              : ""
                          }`}
                        />
                        {errors[actualIndex]?.publicationYear && (
                          <span className={styles.errorMessage}>
                            {errors[actualIndex].publicationYear}
                          </span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Тип публикации:</label>
                        <input
                          type="text"
                          name="publicationType"
                          value={
                            data.publicationType === 1
                              ? "Статья"
                              : data.publicationType === 4
                              ? "Монография"
                              : data.publicationType === 6
                              ? "Патент на изобретения / Сертификаты"
                              : data.publicationType || ""
                          }
                          readOnly={
                            data.publicationType === 1 ||
                            data.publicationType === 4 ||
                            data.publicationType === 6
                          }
                          className={`${styles.input} ${
                            data.publicationType === 1 ||
                            data.publicationType === 4 ||
                            data.publicationType === 6
                              ? styles.disabledInput
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                    <div className={styles.column}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Страницы:</label>
                        <input
                          type="text"
                          name="pages"
                          value={data.pages || ""}
                          onChange={(e) => handleChange(e, actualIndex)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Рейтинг:<span className={styles.required}> *</span>
                        </label>
                        <div className={styles.inputGroup}>
                          <select
                            name="rating"
                            value={data.rating || ""}
                            onChange={(e) => handleChange(e, actualIndex)}
                            className={`${styles.input} ${
                              errors[actualIndex]?.rating
                                ? styles.errorInput
                                : ""
                            }`}
                          >
                            <option value="">Выбор из списка</option>
                            {ratingList.map((rating) => (
                              <option key={rating.id} value={rating.name}>
                                {rating.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors[actualIndex]?.rating && (
                          <span className={styles.errorMessage}>
                            {errors[actualIndex].rating}
                          </span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Издатель:<span className={styles.required}> *</span>
                        </label>
                        <input
                          type="text"
                          name="publisher"
                          value={data.publisher || ""}
                          onChange={(e) => handleChange(e, actualIndex)}
                          className={`${styles.input} ${
                            errors[actualIndex]?.publisher
                              ? styles.errorInput
                              : ""
                          }`}
                        />
                        {errors[actualIndex]?.publisher && (
                          <span className={styles.errorMessage}>
                            {errors[actualIndex].publisher}
                          </span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>Тема:</label>
                        <input
                          type="text"
                          name="theme"
                          value={data.theme || ""}
                          onChange={(e) => handleChange(e, actualIndex)}
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Институт<span className={styles.required}> *</span>
                        </label>
                        <div className={styles.inputGroup}>
                          <select
                            name="institutes"
                            value={data.institutes || ""}
                            onChange={(e) => handleChange(e, actualIndex)}
                            className={`${styles.input} ${
                              errors[actualIndex]?.institutes
                                ? styles.errorInput
                                : ""
                            }`}
                          >
                            <option value="">Выбор из списка</option>
                            {institutesList.map((institutes) => (
                              <option key={institutes.id} value={institutes.id}>
                                {institutes.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors[actualIndex]?.institutes && (
                          <span className={styles.errorMessage}>
                            {errors[actualIndex].institutes}
                          </span>
                        )}
                      </div>

                      <div className={styles.formGroup}>
                        <label className={styles.label}>
                          Кафедра<span className={styles.required}> *</span>
                        </label>
                        <div className={styles.inputGroup}>
                          <select
                            name="department"
                            value={data.department || ""}
                            onChange={(e) => handleChange(e, actualIndex)}
                            disabled={!data.institutes}
                            className={`${styles.input} ${
                              errors[actualIndex]?.department
                                ? styles.errorInput
                                : ""
                            }`}
                          >
                            <option value="">Выбор из списка</option>
                            {data.filteredDepartments?.map((department) => (
                              <option key={department.id} value={department.id}>
                                {department.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        {errors[actualIndex]?.department && (
                          <span className={styles.errorMessage}>
                            {errors[actualIndex].department}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.bottomLine}>
                    <p className={styles.pst}>
                      Поле со звёздочкой ( * ) является обязательным к
                      заполнению
                    </p>
                    <div className={styles.checkboxContainer}>
                      <p className={styles.checkboxContainertext}>
                        {selectedWorks.includes(actualIndex)
                          ? "Статья выбрана"
                          : "Выбрать статью"}
                      </p>

                      <CheckboxParsing
                        checked={selectedWorks.includes(actualIndex)}
                        onChange={() => toggleSelection(actualIndex)}
                      />
                    </div>
                  </div>
                </form>
              </div>
            );
          })}

          <div className={styles.pagination}>
            {getDisplayedPages().map((page, index) => {
              if (page === "...") {
                return (
                  <span key={index} className={styles.pageDots}>
                    {page}
                  </span>
                );
              }

              const pageHasErrors = Array.from(
                { length: resultsPerPage },
                (_, i) => {
                  const itemIndex = (page - 1) * resultsPerPage + i;
                  return (
                    selectedWorks.includes(itemIndex) &&
                    Object.keys(errors[itemIndex] || {}).length > 0
                  );
                }
              ).some(Boolean);

              return (
                <button
                  key={index}
                  onClick={() => paginate(page)}
                  className={`${styles.pageButton} ${
                    currentPage === page ? styles.active : ""
                  } ${pageHasErrors ? styles.pageWithErrors : ""}`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <div className={styles.buttons}>
            <DeleteButton
              onClick={handleDelete}
              disabled={selectedWorks.length === 0}
              className={selectedWorks.length === 0 ? "disableddBtn" : ""}
            >
              Удалить
            </DeleteButton>

            <MyButton
              type="submit"
              onClick={handleAdd}
              disabled={selectedWorks.length === 0}
              className={selectedWorks.length === 0 ? "disabledBtn" : ""}
            >
              Добавить
            </MyButton>

            <NotificationSuccess
              message="Результат импорта работ успешно добавлен"
              show={showNotificationSuccess}
            />
            <NotificationDelete
              message="Результат импорта работ успешно удален"
              show={showNotificationDelete}
            />
          </div>
        </>
      ) : (
        <p className={styles.toptext}>Данные отсутствуют</p>
      )}
    </div>
  );
};

export default ParsingResults;