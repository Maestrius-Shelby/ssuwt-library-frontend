import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./Create.module.css";
import MyModal from "../MyModal/MyModal";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import ModalUserBase from "../ModalUserBase/ModalUserBase";
import MyButton from "../button/MyButton";
import { fetchInitialData } from "../../../ReduxStore/reducers/dataSlice";
import UploadFiles from "../UploadFiles/UploadFiles";
import { submitDocument } from "../../../ReduxStore/reducers/documentSlice";
import NotificationSuccess from "../NotificationSuccess/NotificationSuccess";

const Create = () => {
  const dispatch = useDispatch();

  // Данные из Redux (dataSlice)
  const {
    humanData,
    departmentData: departmentList,
    institutesData: institutesList,
    ratingData: ratingList,
    publicationTypeData: publicationTypeList,
    relationshipData: relationshipTypeList,
  } = useSelector((state) => state.data);

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({
    documentName: "",
    publicationType: "",
    theme: "",
    rating: "",
    journal_publisher: "",
    publicationYear: "",
    numberPages: "",
    department: "",
    institutes: "",
    author: "",
    authors: [],
    relationshipType: "",
    file: null,
  });
  const [errors, setErrors] = useState({});
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [roles, setRoles] = useState({});
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);

  const authorRefs = useRef([]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Ограничение длины текста
    if (name === "documentName" && value.length > 300) {
      return;
    }
    if (name === "theme" && value.length > 150) {
      return;
    }
    if (name === "journal_publisher" && value.length > 200) {
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
      name === "numberPages" &&
      (value.length > 10 || !/^\d{0,4}(-\d{0,4})?$/.test(value))
    ) {
      return;
    }

    setForm((prevForm) => {
      const newForm = { ...prevForm, [name]: value };

      if (name === "institutes") {
        newForm.department = "";
      }

      return newForm;
    });

    validateField(name, value);
  };

  const resetForm = () => {
    setForm({
      documentName: "",
      publicationType: "",
      theme: "",
      rating: "",
      journal_publisher: "",
      publicationYear: "",
      numberPages: "",
      department: "",
      institutes: "",
      author: "",
      authors: [],
      relationshipType: "",
      file: null,
    });

    setAuthors([]);
    setRoles({});
    setErrors({});
    setSelectedUsers([]);
  };

  const handleFileChange = (e) => {
    const files = e.dataTransfer ? e.dataTransfer.files : e.target?.files;

    if (files && files[0]) {
      setForm({
        ...form,
        file: files[0],
      });
    } else {
      // Обработка удаления файла
      setForm({
        ...form,
        file: null,
      });
    }

    // Убираем ошибку, если она была
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors.file;
      return newErrors;
    });
  };

  const validateField = (name, value) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (name === "file") {
        delete newErrors[name];
      } else if (value) {
        delete newErrors[name];
      } else if (
        name === "publicationType" ||
        name === "rating" ||
        name === "institutes" ||
        name === "department"
      ) {
        newErrors[name] = "Выберите один из пунктов списка";
      } else if (name !== "theme" && name !== "numberPages") {
        newErrors[name] = "Заполните поле";
      }

      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    console.log("Ошибки валидации (до проверки):", newErrors);

    const selectFields = new Set([
      "publicationType",
      "rating",
      "institutes",
      "department",
    ]);

    for (const [key, value] of Object.entries(form)) {
      if (selectFields.has(key) && !value) {
        newErrors[key] = "Выберите один из пунктов списка";
      } else if (
        !value &&
        key !== "author" &&
        key !== "relationshipType" &&
        key !== "file" &&
        key !== "theme" &&
        key !== "numberPages"
      ) {
        // Убираем проверку для `authors` и `relationshipType`
        newErrors[key] = "Заполните поле";
      }
    }

    // Проверка наличия хотя бы одного автора
    if (authors.length === 0) {
      newErrors.authors = "Добавьте хотя бы одного участника";
    }

    // Проверка ролей авторов (relationshipType)
    authors.forEach((_, index) => {
      if (!roles[index]) {
        newErrors[`relationshipType_${index}`] = "Выберите роль для участника";
      }
    });

    console.log("Ошибки валидации (после проверки):", newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseAuthor = (author) => {
    const parts = author.trim().split(" ");
    const lastName = parts[0];
    let firstName = "";
    let middleName = "";

    if (parts[1]) {
      const initials = parts[1].split(".");
      firstName = initials[0] ? initials[0] : "";
      middleName = initials[1] ? initials[1] : "";
    }

    // ищем человека по ФИО
    const human = findHumanData(lastName, firstName, middleName);

    return human ? { id: human.id } : null;
  };

  const findHumanData = (lastName, firstInitial, middleInitial) => {
    return (
      humanData.find(
        (person) =>
          person.last_name === lastName &&
          (!firstInitial ||
            (person.first_name &&
              person.first_name.startsWith(firstInitial))) &&
          (!middleInitial ||
            (person.middle_name &&
              person.middle_name.startsWith(middleInitial)))
      ) ?? null
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        // Преобразуем авторов: ищем их id по ФИО
        const authorsWithIds = authors.map((author, index) => {
          const humanObj = parseAuthor(author);

          if (!humanObj) {
            console.error(`Участник с ФИО ${author} не найден!`);
            throw new Error(`Участник не найден: ${author}`);
          }

          return {
            human: humanObj.id,
            relationship_type: roles[index],
          };
        });

        // Создаем объект FormData
        const formData = new FormData();
        formData.append("title", form.documentName);
        formData.append("publication_type", form.publicationType);
        formData.append("theme", form.theme);
        formData.append("journal_publisher", form.journal_publisher);
        formData.append("publication_year", form.publicationYear);
        formData.append("count_of_pages", form.numberPages);
        formData.append("link", form.link || "");
        formData.append("rating", form.rating);
        formData.append("department", form.department);
        formData.append("authors", JSON.stringify(authorsWithIds.flat()));

        if (form.file) {
          formData.append("attached_file", form.file);
        }

        const response = await dispatch(submitDocument(formData));

        if (response.payload) {
          resetForm();
          setShowNotificationSuccess(true);
          setTimeout(() => setShowNotificationSuccess(false), 3000);
          return;
        }
      } catch (error) {
        console.error("Ошибка при отправке данных:", error);
        throw error;
      }
    }
  };

  const removeAuthor = (index) => {
    setAuthors((prevAuthors) => prevAuthors.filter((_, i) => i !== index));

    setRoles((prevRoles) => {
      const updatedRoles = {};
      authors.forEach((_, i) => {
        if (i !== index) {
          const newIndex = i > index ? i - 1 : i;
          updatedRoles[newIndex] = prevRoles[i];
        }
      });
      return updatedRoles;
    });

    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };

      // Удаляем ошибку для удаленного участника
      delete updatedErrors[`relationshipType_${index}`];

      // Пересчитываем ошибки для оставшихся участников
      authors.forEach((_, i) => {
        if (i !== index) {
          const newIndex = i > index ? i - 1 : i;
          if (!roles[i]) {
            updatedErrors[`relationshipType_${newIndex}`] =
              "Выберите роль для участника";
          } else {
            delete updatedErrors[`relationshipType_${newIndex}`];
          }
        }
      });

      return updatedErrors;
    });
  };

  const handleRoleChange = (index, role) => {
    setRoles({
      ...roles,
      [index]: role,
    });

    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      if (role) {
        delete newErrors[`relationshipType_${index}`];
      } else {
        newErrors[`relationshipType_${index}`] = "Выберите роль для участника";
      }
      return newErrors;
    });
  };

  const addSelectedUsers = () => {
    const newAuthors = selectedUsers.map((userId) => {
      const user = humanData.find((user) => user.id === userId);
      if (user) {
        const middleName = user.middle_name ? `${user.middle_name[0]}.` : "";

        return `${user.last_name} ${user.first_name[0]}.${middleName}`.trim();
      }
      return "";
    });

    const newAuthorsIds = selectedUsers;

    // Добавляем новых авторов в состояние
    setAuthors((prev) => [...prev, ...newAuthors]);

    // Обновляем роли для новых авторов
    setRoles((prev) => {
      const updatedRoles = { ...prev };
      newAuthorsIds.forEach((id, index) => {
        const newIndex = authors.length + index; // Смещение для новых авторов
        updatedRoles[newIndex] = ""; // Задаем пустую роль для новых авторов
      });
      return updatedRoles;
    });

    // Обновляем форму с новыми авторами и их id
    setForm((prevForm) => ({
      ...prevForm,
      author: [...authors, ...newAuthors].join(", "),
      authors: [...form.authors, ...newAuthorsIds],
    }));

    // Очистка выбранных пользователей
    setSelectedUsers([]);
    setModal(false);

    // Проверка ошибок
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };
      delete newErrors["authors"];

      // Проверяем, если роль для каждого автора не выбрана, добавляем ошибку
      newAuthorsIds.forEach((_, index) => {
        const newIndex = authors.length + index; // Смещение для новых авторов
        if (!roles[newIndex]) {
          newErrors[`relationshipType_${newIndex}`] =
            "Выберите роль для участника";
        }
      });

      return newErrors;
    });
  };

  useEffect(() => {
    if (form.institutes) {
      // Получаем название института по id
      const selectedInstituteName = institutesList.find(
        (institute) => institute.id === parseInt(form.institutes, 10)
      )?.name;

      if (selectedInstituteName) {
        // Фильтруем кафедры, сравнивая по имени института
        const filtered = departmentList.filter(
          (department) => department.institute === selectedInstituteName
        );
        setFilteredDepartments(filtered);
      } else {
        setFilteredDepartments([]);
      }
    } else {
      setFilteredDepartments([]);
    }
  }, [form.institutes, departmentList, institutesList]);

  return (
    <div className={styles.container}>
      <div className={styles.toptext}>
        <h1>Добавление документа</h1>
        <p>
          После отправки документ пройдет процедуру верификации, после чего
          будет опубликован.
        </p>
      </div>
      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.column}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Наименование документа
                <span className={styles.required}> *</span>
              </label>
              <input
                type="text"
                name="documentName"
                value={form.documentName}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.documentName ? styles.error : ""
                }`}
              />
              {errors.documentName && (
                <span className={styles.errorMessage}>
                  {errors.documentName}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Тип публикации<span className={styles.required}> *</span>
              </label>
              <div className={styles.inputGroup}>
                <select
                  name="publicationType"
                  value={form.publicationType}
                  onChange={handleChange}
                  className={`${styles.select} ${
                    errors.publicationType ? styles.error : ""
                  }`}
                >
                  <option value="">Выбор из списка</option>
                  {publicationTypeList.map((publicationType) => (
                    <option key={publicationType.id} value={publicationType.id}>
                      {publicationType.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.publicationType && (
                <span className={styles.errorMessage}>
                  {errors.publicationType}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Тема</label>
              <input
                type="text"
                name="theme"
                value={form.theme}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.theme ? styles.error : ""
                }`}
              />
              {errors.theme && (
                <span className={styles.errorMessage}>{errors.theme}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Рейтинг<span className={styles.required}> *</span>
              </label>
              <div className={styles.inputGroup}>
                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                  className={`${styles.select} ${
                    errors.rating ? styles.error : ""
                  }`}
                >
                  <option value="">Выбор из списка</option>
                  {ratingList.map((rating) => (
                    <option key={rating.id} value={rating.id}>
                      {rating.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.rating && (
                <span className={styles.errorMessage}>{errors.rating}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Участники научного процесса{" "}
                <span className={styles.required}> *</span>
              </label>
              <div className={styles.authorContainer}>
                <TransitionGroup>
                  {authors.map((author, index) => {
                    authorRefs.current[index] =
                      authorRefs.current[index] || React.createRef();

                    return (
                      <CSSTransition
                        key={index}
                        timeout={400}
                        classNames="author"
                        nodeRef={authorRefs.current[index]}
                      >
                        <div
                          ref={authorRefs.current[index]}
                          className={styles.authorEntry}
                        >
                          <input
                            type="text"
                            value={author}
                            readOnly
                            className={styles.input}
                          />
                          <div className={styles.inputGroup}>
                            <select
                              name="relationshipType"
                              value={roles[index] || ""}
                              onChange={(e) =>
                                handleRoleChange(index, e.target.value)
                              }
                              className={`${styles.select} ${
                                errors[`relationshipType_${index}`]
                                  ? styles.error
                                  : ""
                              }`}
                            >
                              <option value="">Выбор из списка</option>
                              {relationshipTypeList.map((relationshipType) => (
                                <option
                                  key={relationshipType.id}
                                  value={relationshipType.id}
                                >
                                  {relationshipType.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => removeAuthor(index)}
                          >
                            Удалить
                          </button>
                          {errors[`relationshipType_${index}`] && (
                            <span className={styles.errorMessageType}>
                              {errors[`relationshipType_${index}`]}
                            </span>
                          )}
                        </div>
                      </CSSTransition>
                    );
                  })}
                </TransitionGroup>
                <div className={styles.inputGroup}>
                  <MyButton
                    type="button"
                    onClick={() => setModal(true)}
                    style={errors["authors"] ? { border: "1px solid red" } : {}}
                  >
                    Добавить участника
                  </MyButton>
                </div>
                {errors["authors"] && (
                  <span className={styles.errorMessage}>
                    {errors["authors"]}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className={styles.column}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Издатель<span className={styles.required}> *</span>
              </label>
              <input
                type="text"
                name="journal_publisher"
                value={form.journal_publisher}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.journal_publisher ? styles.error : ""
                }`}
              />
              {errors.journal_publisher && (
                <span className={styles.errorMessage}>
                  {errors.journal_publisher}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Год публикации<span className={styles.required}> *</span>
              </label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="publicationYear"
                  placeholder="гггг"
                  value={form.publicationYear}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.publicationYear ? styles.error : ""
                  }`}
                />
              </div>
              {errors.publicationYear && (
                <span className={styles.errorMessage}>
                  {errors.publicationYear}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Количество страниц</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="numberPages"
                  value={form.numberPages}
                  onChange={handleChange}
                  className={`${styles.input} ${
                    errors.numberPages ? styles.error : ""
                  }`}
                />
              </div>
              {errors.numberPages && (
                <span className={styles.errorMessage}>
                  {errors.numberPages}
                </span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Институт<span className={styles.required}> *</span>
              </label>
              <div className={styles.inputGroup}>
                <select
                  name="institutes"
                  value={form.institutes}
                  onChange={handleChange}
                  className={`${styles.select} ${
                    errors.institutes ? styles.error : ""
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
              {errors.institutes && (
                <span className={styles.errorMessage}>{errors.institutes}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Кафедра<span className={styles.required}> *</span>
              </label>
              <div className={styles.inputGroup}>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  disabled={!form.institutes}
                  className={`${styles.select} ${
                    errors.department ? styles.error : ""
                  }`}
                >
                  <option value="">Выбор из списка</option>
                  {filteredDepartments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.department && (
                <span className={styles.errorMessage}>{errors.department}</span>
              )}
            </div>
          </div>
          <div className={styles.buttomContainer}>
            <div className={styles.formGroup}>
              <UploadFiles
                className={`${styles.uploadArea} ${
                  errors.file ? styles.error : ""
                }`}
                form={form}
                handleFileChange={handleFileChange}
                errors={errors}
              />
            </div>
            <MyButton type="submit">Отправить на верификацию</MyButton>
            <p className={styles.pst}>
              Поле со звёздочкой ( * ) является обязательным к заполнению
            </p>
          </div>
        </form>

        <MyModal visible={modal} setVisible={setModal}>
          <ModalUserBase
            humanData={humanData}
            addSelectedUsers={addSelectedUsers}
            selectedUsers={selectedUsers}
            setSelectedUsers={setSelectedUsers}
            authors={authors}
          />
        </MyModal>

        <NotificationSuccess
          message="Документ был успешно отправлен на верификацию!"
          show={showNotificationSuccess}
        />
      </div>
    </div>
  );
};

export default Create;
