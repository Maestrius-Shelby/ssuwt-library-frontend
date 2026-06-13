import React, { useState, useRef, useEffect } from "react";
import styles from "./ModalAuthorBase.module.css";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import MyButton from "../button/MyButton";
import AnimatedCheckbox from "../Checkbox/AnimatedCheckbox";

const ModalAuthorBase = ({
  userDatabase,
  addSelectedUsers,
  selectedUsers,
  setSelectedUsers,
  authors,
  isOverlayActive,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({});
  const authorRefs = useRef([]);

  useEffect(() => {
    const updatedErrors = {};
    selectedUsers.forEach((userId) => {
      const user = userDatabase.find((user) => user.id === userId);
      const userFullName = `${user.last_name} ${user.first_name} ${user.middle_name}`;
      if (user && authors.includes(userFullName)) {
        updatedErrors[userId] = "Пользователь уже добавлен.";
      }
    });
    setErrors(updatedErrors);
  }, [selectedUsers, authors, userDatabase]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleUserSelect = (userId) => {
    if (isOverlayActive) {
      // Если кнопка "По фамилии" активна, разрешаем выбрать только одного автора
      if (selectedUsers.includes(userId)) {
        // Если выбранный автор уже выбран, снимаем выбор
        setSelectedUsers([]);
      } else {
        // Иначе выбираем нового автора, сбрасывая предыдущий выбор
        setSelectedUsers([userId]);
      }
    } else {
      // Если кнопка "По фамилии" не активна, разрешаем множественный выбор
      const newSelectedUsers = [...selectedUsers];
      if (newSelectedUsers.includes(userId)) {
        setSelectedUsers(newSelectedUsers.filter((id) => id !== userId));
      } else {
        setSelectedUsers([...newSelectedUsers, userId]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newAuthors = selectedUsers.map((userId) => {
      const user = userDatabase.find((user) => user.id === userId);
      if (!user) return "";
      return `${user.fio}`;
    });

    const duplicateErrors = {};
    newAuthors.forEach((authorName, index) => {
      if (authors.includes(authorName)) {
        duplicateErrors[selectedUsers[index]] = "Пользователь уже добавлен.";
      }
    });

    if (Object.keys(duplicateErrors).length > 0) {
      setErrors(duplicateErrors);
      return;
    }

    setErrors({});
    addSelectedUsers(newAuthors.filter((name) => name));

    setSelectedUsers([]);
  };

  const filteredUsers = userDatabase.filter((user) => {
    const searchWords = searchQuery.toLowerCase().split(/\s+/); // Разделяем запрос на отдельные слова
    const userFields = [
      user.last_name?.toLowerCase(),
      user.first_name?.toLowerCase(),
      user.middle_name?.toLowerCase(),
      user.birth_date?.toLowerCase(),
      user.job_title?.toLowerCase(),
      user.department?.institute?.toLowerCase(),
      user.department?.name?.toLowerCase(),
    ].filter(Boolean);

    // Проверяем, чтобы каждое слово из `searchQuery` совпадало с любым из полей пользователя
    return searchWords.every((word) =>
      userFields.some((field) => field?.includes(word))
    );
  });

  const hasErrors = selectedUsers.some((userId) => errors[userId]);
  const isSubmitDisabled = !selectedUsers.length || hasErrors;

  return (
    <div className={styles.container}>
      <div className={styles.titleresult}>
        <h1>База авторов</h1>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск пользователей..."
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <div
          className={`${styles.tableContainer} ${
            filteredUsers.length === 0
              ? `${styles.noScroll} ${styles.noResultsContainer}`
              : ""
          }`}
        >
          {filteredUsers.length > 0 ? (
            <>
              <div className={styles.results}>
                <TransitionGroup component={null}>
                  {filteredUsers.map((user) => {
                    if (!authorRefs.current[user.id]) {
                      authorRefs.current[user.id] = React.createRef();
                    }
                    return (
                      <CSSTransition
                        key={user.id}
                        timeout={300}
                        classNames="fade"
                        nodeRef={authorRefs.current[user.id]}
                      >
                        <div
                          ref={authorRefs.current[user.id]}
                          className={`${styles.resultItem} ${
                            selectedUsers.includes(user.id) ? styles.active : ""
                          } ${errors[user.id] ? styles.error : ""}`}
                        >
                          <span className={styles.title}>
                            {user.last_name} {user.first_name?.[0]}.
                            {user.middle_name ? `${user.middle_name[0]}.` : ""}
                          </span>
                          <span className={styles.details}>
                            Дата рождения: {user.birth_date || "Не указано"} /{" "}
                            {user.job_title || "Не указано"} /
                            {user.department?.institute || "Не указано"} /
                            {user.department?.name || "Не указано"}
                          </span>
                          <div className={styles.checkboxContainer}>
                            <AnimatedCheckbox
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleUserSelect(user.id)}
                              hasError={!!errors[user.id]}
                            />
                          </div>
                          {errors[user.id] && (
                            <span className={styles.errorText}>
                              {errors[user.id]}
                            </span>
                          )}
                        </div>
                      </CSSTransition>
                    );
                  })}
                </TransitionGroup>
              </div>
            </>
          ) : (
            <p className={styles.noResults}>Данные не найдены</p>
          )}
        </div>
        <div className={styles.buttonGroup}>
          <MyButton type="submit" disabled={isSubmitDisabled}>
            Добавить автора
          </MyButton>
        </div>
      </form>
    </div>
  );
};

export default ModalAuthorBase;
