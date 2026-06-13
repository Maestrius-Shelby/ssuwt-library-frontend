import React, { useState, useEffect, useRef } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import styles from "./AdvncFormSearch.module.css";
import { useNavigate } from "react-router-dom";
import MyModal from "../MyModal/MyModal";
import ModalAuthorBase from "../ModalAuthorBase/ModalAuthorBase";
import ModalScientDirector from "../ModalScientDirector/ModalScientDirector";
import MyButton from "../button/MyButton";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchInitialData,
  searchScientificMaterials,
  setSearchPerformed,
  setSearchResults,
  setIsLoading,
} from "../../../ReduxStore/reducers/dataSlice";
import { makeSelectData } from "../../../ReduxStore/selectors/dataSelectors";
import NotificationWarning from "../NotificationWarning/NotificationWarning";

const AdvncFormSearch = ({
  onFindClick,
  filters,
  setFilters,
  isOverlayActive,
  isDepartmentOverlayActive,
  onClear,
  setIsAuthorAdded,
  setIsInstituteSelected,
  setIsDepartmentSelected,
  isSearchClicked,
  setIsSearchClicked,
  setAuthorFio,
}) => {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const [modalAuthor, setModalAuthor] = useState(false);
  const [modalScientDirector, setModalScientDirector] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState([]);
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [roles, setRoles] = useState([]);
  const [showNotificationWarning, setShowNotificationWarning] = useState(false);
  const authorRefs = useRef([]);
  const supervisorRefs = useRef([]);
  const [form, setForm] = useState({
    title: "",
    publicationType: "",
    theme: "",
    rating: "",
    journal_publisher: "",
    publicationYear: "",
    count_of_pages: "",
    department: "",
    supervisor: "",
    institutes: "",
    author: "",
    authors: "",
    supervisors: "",
  });

  const {
    institutesList,
    departmentList,
    userDatabase,
    ratingList,
    publicationTypeList,
  } = useSelector(makeSelectData);

  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [isAddAuthorDisabled, setIsAddAuthorDisabled] = useState(false);

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (
      ["title", "theme", "journal_publisher"].includes(name) &&
      value.length > 100
    ) {
      return;
    }

    if (
      name === "publicationYear" &&
      (value.length > 4 || !/^\d*$/.test(value))
    ) {
      return;
    }

    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
      ...(name === "institutes" && { department: "" }),
    }));
  };

  const addSelectedAuthors = () => {
    const newAuthors = selectedAuthors.map((userId) => {
      const user = userDatabase.find((user) => user.id === userId);
      if (user) {
        const middleName = user.middle_name ? `${user.middle_name[0]}.` : "";

        return `${user.last_name} ${user.first_name[0]}.${middleName}`.trim();
      }
      return "";
    });
    const newAuthorsIds = selectedAuthors;

    setAuthors((prev) => [...prev, ...newAuthors]);
    setRoles((prev) => [...prev, ...new Array(newAuthors.length).fill("")]);

    setForm((prevForm) => ({
      ...prevForm,
      author: [...authors, ...newAuthors].join(", "),
      authors: [...form.authors, ...newAuthorsIds],
    }));

    setSelectedAuthors((prevSelected) =>
      prevSelected.filter((userId) => !newAuthorsIds.includes(userId))
    );
    setModalAuthor(false);

    if (setIsSearchClicked) {
      setIsSearchClicked(false);
    }
  };

  const removeAuthor = (index) => {
    // Получаем массив авторов
    const updatedAuthors = authors.filter((_, i) => i !== index);
    const updatedRoles = roles.filter((_, i) => i !== index);

    // Используем обновленный массив authors для обновления form.authors
    const updatedAuthorsIds = form.authors.filter((_, i) => i !== index); // Это теперь массив, а не строка

    // Обновляем состояния authors, roles и form
    setAuthors(updatedAuthors);
    setRoles(updatedRoles);

    setForm((prevForm) => ({
      ...prevForm,
      author: updatedAuthors.join(", "), // Обновляем строку авторов
      authors: updatedAuthorsIds, // Сохраняем как массив
    }));

    // Снимаем выбор пользователя, если он был добавлен
    const removedUser = authors[index];
    const userToDeselect = userDatabase.find(
      (user) => user.fio === removedUser
    );
    if (userToDeselect) {
      setSelectedAuthors((prevSelected) =>
        prevSelected.filter((userId) => userId !== userToDeselect.id)
      );
    }
  };

  const addSelectedSupervisors = () => {
    // Получаем новых руководителей
    const newSupervisors = selectedSupervisors.map((userId) => {
      const user = userDatabase.find((user) => user.id === userId);
      if (user) {
        const middleName = user.middle_name ? `${user.middle_name[0]}.` : "";

        return `${user.last_name} ${user.first_name[0]}.${middleName}`.trim();
      }
      return "";
    });

    // Сохраняем ID новых руководителей
    const newSupervisorsIds = selectedSupervisors;

    // Обновляем список руководителей
    setSupervisors((prev) => [...prev, ...newSupervisors]);

    // Обновляем роли (аналогично тому, как это делаем для авторов)
    setRoles((prev) => [...prev, ...new Array(newSupervisors.length).fill("")]);

    // Обновляем форму
    setForm((prevForm) => ({
      ...prevForm,
      supervisor: [...supervisors, ...newSupervisors].join(", "),
      supervisors: [...form.supervisors, ...newSupervisorsIds],
    }));

    // Очищаем выбранных руководителей
    setSelectedSupervisors((prevSelected) =>
      prevSelected.filter((userId) => !newSupervisorsIds.includes(userId))
    );

    // Закрываем модальное окно для выбора руководителей
    setModalScientDirector(false);
  };

  const removeSupervisor = (index) => {
    // Получаем массив научных руководителей
    const updatedSupervisors = supervisors.filter((_, i) => i !== index);
    const updatedRoles = roles.filter((_, i) => i !== index);

    // Используем обновленный массив supervisors для обновления form.supervisors
    const updatedSupervisorsIds = form.supervisors.filter(
      (_, i) => i !== index
    ); // Это теперь массив, а не строка

    // Обновляем состояния supervisors, roles и form
    setSupervisors(updatedSupervisors);
    setRoles(updatedRoles);

    setForm((prevForm) => ({
      ...prevForm,
      supervisor: updatedSupervisors.join(", "), // Обновляем строку supervisors
      supervisors: updatedSupervisorsIds, // Сохраняем как массив
    }));

    // Снимаем выбор пользователя, если он был добавлен
    const removedUser = supervisors[index];
    const userToDeselect = userDatabase.find(
      (user) => user.fio === removedUser
    );
    if (userToDeselect) {
      setSelectedSupervisors((prevSelected) =>
        prevSelected.filter((userId) => userId !== userToDeselect.id)
      );
    }
  };

  useEffect(() => {
    if (typeof setIsSearchClicked === "function") {
      setIsSearchClicked(false);
    }
  }, [form.institutes, form.department, setIsSearchClicked]);

  useEffect(() => {
    if (isSearchClicked) {
      setIsInstituteSelected(!!form.institutes);
      setIsDepartmentSelected(!!form.department);
    }
  }, [
    form.institutes,
    form.department,
    isSearchClicked,
    setIsInstituteSelected,
    setIsDepartmentSelected,
  ]);

  useEffect(() => {
    if (isSearchClicked) {
      setIsAuthorAdded(authors.length > 0);
    }
  }, [authors, isSearchClicked, setIsAuthorAdded]);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (typeof setIsAuthorAdded === "function") {
      setIsAuthorAdded(true);
    }

    if (typeof setIsInstituteSelected === "function") {
      setIsInstituteSelected(!!form.institutes);
    }

    if (typeof setIsDepartmentSelected === "function") {
      setIsDepartmentSelected(!!form.department);
    }

    if (setIsSearchClicked) {
      setIsSearchClicked(true);
    }

    // Преобразуем authors в массив, если это строка
    const authorsArray =
      typeof form.authors === "string"
        ? form.authors
            .split(",")
            .map((id) => id.trim())
            .filter((id) => id) // Убираем пустые значения
        : form.authors;

    const hasSearchCriteria = Object.values(form).some(
      (value) => typeof value === "string" && value.trim() !== ""
    );

    // Если нет критериев поиска, выводим предупреждение
    if (!hasSearchCriteria) {
      setShowNotificationWarning(true); // Показываем уведомление
      setTimeout(() => setShowNotificationWarning(false), 3000); // Скрываем уведомление через 3 секунды
      return;
    }

    // Подготовленные данные
    const preparedData = {
      ...form,
      authors: authorsArray.filter((id) => id !== null), // Убираем null значения из списка авторов
      author_fio: authors.length > 0 ? authors.join(", ") : "",
    };

    // Обновляем author_fio в состоянии AdvancedSearch
    if (typeof setAuthorFio === "function") {
      setAuthorFio(preparedData.author_fio);
    }

    dispatch(setIsLoading(true)); // Устанавливаем isLoading в true перед началом запроса

    try {
      const results = await dispatch(
        searchScientificMaterials(preparedData)
      ).unwrap();
      dispatch(setSearchResults(results));
      dispatch(setSearchPerformed(true));
      localStorage.setItem("searchResults", JSON.stringify(results));
      localStorage.setItem("searchPerformed", "true");
      navigate("/AdvancedSearch", { state: { scrollToResults: true } });
    } catch (error) {
      console.error("Error searching scientific materials:", error);
    } finally {
      dispatch(setIsLoading(false)); // Завершаем загрузку
    }
  };

  useEffect(() => {
    setIsAddAuthorDisabled(isOverlayActive && authors.length >= 1);
  }, [isOverlayActive, authors]);

  const handleClear = (e) => {
    // e.preventDefault(); // гниение здесь!
    if (e) e.preventDefault();
    console.log("Сброс формы");
    setForm({
      title: "",
      publicationType: "",
      theme: "",
      rating: "",
      journal_publisher: "",
      publicationYear: "",
      count_of_pages: "",
      department: "",
      supervisor: "",
      institutes: "",
      author: "",
      authors: "",
      supervisors: "",
    });
    setFilteredDepartments([]);
    setAuthors([]);
    setSupervisors([]);
    setRoles([]);
  };

  useEffect(() => {
    if (typeof onClear === "function") {
      onClear(handleClear);
    }
  }, [onClear]);

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

  const handleFindClick = () => {
    const isFiltersEmpty = Object.values(filters || {}).every(
      (value) =>
        value === "" ||
        (typeof value === "object" &&
          Object.values(value || {}).every((v) => v === ""))
    );

    if (isFiltersEmpty) {
      const resetFilters = {
        participantCount: "",
        role: "",
        yearRange: { start: "", end: "" },
        alphabetSort: "",
        publicationYearSort: "",
      };

      // Используем setFilters из пропсов
      setFilters(resetFilters);
      onFindClick(resetFilters);
    } else {
      console.log("Фильтры не пустые, отправляем их как есть:", filters);
      onFindClick(filters);
    }
  };

  return (
    <div className={styles.container}>
      <h1 id="search-criteria">Критерии поиска</h1>
      <div className={styles.formWrapper}>
        <form onSubmit={handleSearch} className={styles.formContainer}>
          <div className={styles.column}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Название работы</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  maxLength={100}
                />
              </div>
            </div>

            <div
              className={`${styles.formGroup} ${
                isOverlayActive
                  ? authors.length === 0
                    ? "highlight-red"
                    : "highlight-green"
                  : "highlightExit"
              }`}
            >
              <label className={styles.label}>Автор</label>
              <div className={styles.authorContainer}>
                <TransitionGroup>
                  {authors.map((author, index) => {
                    // Убедимся, что реф существует для данного индекса
                    authorRefs.current[index] =
                      authorRefs.current[index] || React.createRef();

                    return (
                      <CSSTransition
                        key={index}
                        timeout={400}
                        classNames="author"
                        nodeRef={authorRefs.current[index]} // Используем реф для CSSTransition
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
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => removeAuthor(index)}
                          >
                            Удалить
                          </button>
                        </div>
                      </CSSTransition>
                    );
                  })}
                </TransitionGroup>
                <div className={styles.inputGroup}>
                  <MyButton
                    type="button"
                    onClick={() => setModalAuthor(true)}
                    disabled={isAddAuthorDisabled}
                  >
                    Добавить автора
                  </MyButton>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Тип публикации</label>
              <div className={styles.inputGroup}>
                <select
                  name="publicationType"
                  value={form.publicationType}
                  onChange={handleChange}
                >
                  <option value="">Выбор из списка</option>
                  {publicationTypeList.map((publicationType) => (
                    <option key={publicationType.id} value={publicationType.id}>
                      {publicationType.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Тематика</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Научный руководитель</label>
              <div className={styles.supervisorContainer}>
                <TransitionGroup>
                  {supervisors.map((supervisor, index) => {
                    // Убедимся, что реф существует для данного индекса
                    supervisorRefs.current[index] =
                      supervisorRefs.current[index] || React.createRef();

                    return (
                      <CSSTransition
                        key={index}
                        timeout={400}
                        classNames="supervisor"
                        nodeRef={supervisorRefs.current[index]} // Используем реф для CSSTransition
                      >
                        <div
                          ref={supervisorRefs.current[index]}
                          className={styles.supervisorEntry}
                        >
                          <input
                            type="text"
                            value={supervisor}
                            readOnly
                            className={styles.input}
                          />
                          <button
                            type="button"
                            className={styles.deleteButton}
                            onClick={() => removeSupervisor(index)}
                          >
                            Удалить
                          </button>
                        </div>
                      </CSSTransition>
                    );
                  })}
                </TransitionGroup>
                <div className={styles.inputGroup}>
                  <MyButton
                    type="button"
                    onClick={() => setModalScientDirector(true)}
                  >
                    Добавить руководителя
                  </MyButton>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.column}>
            {/* Второй столбец */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Рейтинг</label>
              <div className={styles.inputGroup}>
                <select
                  name="rating"
                  value={form.rating}
                  onChange={handleChange}
                >
                  <option value="">Выбор из списка</option>
                  {ratingList.map((rating) => (
                    <option key={rating.id} value={rating.id}>
                      {rating.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Издатель</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="journal_publisher"
                  value={form.journal_publisher}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Год публикации</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="publicationYear"
                  placeholder="гггг"
                  value={form.publicationYear}
                  onChange={handleChange}
                  className={styles.underlineInput}
                />
              </div>
            </div>

            <div
              className={`${styles.formGroup} ${
                isDepartmentOverlayActive
                  ? form.institutes
                    ? "highlight-green"
                    : "highlight-red"
                  : "highlightExit"
              }`}
            >
              <label className={styles.label}>Институт</label>
              <div className={styles.inputGroup}>
                <select
                  name="institutes"
                  value={form.institutes}
                  onChange={handleChange}
                >
                  <option value="">Выбор из списка</option>
                  {institutesList.map((institutes) => (
                    <option key={institutes.id} value={institutes.id}>
                      {institutes.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div
              className={`${styles.formGroup} ${
                isDepartmentOverlayActive
                  ? form.department
                    ? "highlight-green"
                    : "highlight-red"
                  : "highlightExit"
              }`}
            >
              <label className={styles.label}>Кафедра</label>
              <div className={styles.inputGroup}>
                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  disabled={!form.institutes}
                >
                  <option value="">Выбор из списка</option>
                  {filteredDepartments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div
            className={`${styles.buttomContainer} ${
              isOverlayActive || isDepartmentOverlayActive
                ? isSearchClicked
                  ? "highlight-green"
                  : "highlight-red"
                : "highlightExit"
            }`}
          >
            <MyButton type="submit" onClick={handleFindClick}>
              Найти
            </MyButton>

            <button
              className={styles.clearButton}
              onClick={(e) => {
                handleClear(e);
                onClear(handleClear);
              }}
            >
              Сброс критериев
            </button>
          </div>
        </form>
      </div>
      <MyModal visible={modalAuthor} setVisible={setModalAuthor}>
        <ModalAuthorBase
          userDatabase={userDatabase}
          addSelectedUsers={addSelectedAuthors}
          selectedUsers={selectedAuthors}
          setSelectedUsers={setSelectedAuthors}
          authors={authors}
          isOverlayActive={isOverlayActive}
        />
      </MyModal>

      <MyModal
        visible={modalScientDirector}
        setVisible={setModalScientDirector}
      >
        <ModalScientDirector
          userDatabase={userDatabase}
          addSelectedUsers={addSelectedSupervisors}
          selectedUsers={selectedSupervisors}
          setSelectedUsers={setSelectedSupervisors}
          supervisors={supervisors}
        />
      </MyModal>

      <NotificationWarning
        message="Укажите или выберите хотя бы один критерий."
        show={showNotificationWarning}
      />
    </div>
  );
};

export default AdvncFormSearch;
