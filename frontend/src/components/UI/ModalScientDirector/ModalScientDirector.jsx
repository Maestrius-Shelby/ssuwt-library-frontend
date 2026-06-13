import React, { useState, useEffect, useRef } from "react";
import styles from "./ModalScientDirector.module.css";
import MyButton from "../button/MyButton";
import AnimatedCheckbox from "../Checkbox/AnimatedCheckbox";
import { CSSTransition, TransitionGroup } from "react-transition-group";

const ModalSupervisorsBase = ({
  userDatabase,
  addSelectedUsers,
  selectedUsers,
  setSelectedUsers,
  supervisors,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [errors, setErrors] = useState({});
  const supervisorRefs = useRef([]);

  useEffect(() => {
    const updatedErrors = {};

    // Проверяем, чтобы не было дублирующихся научных руководителей
    selectedUsers.forEach((userId) => {
      const user = userDatabase.find((user) => user.id === userId);
      const supervisorFullName = `${user.last_name} ${user.first_name} ${user.middle_name}`;

      // Если руководитель уже добавлен, добавляем ошибку
      if (user && supervisors.includes(supervisorFullName)) {
        updatedErrors[userId] = "Научный руководитель уже добавлен.";
      }
    });

    setErrors(updatedErrors);
  }, [selectedUsers, supervisors, userDatabase]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleUserSelect = (userId) => {
    const newSelectedUsers = [...selectedUsers];
    if (newSelectedUsers.includes(userId)) {
      setSelectedUsers(newSelectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...newSelectedUsers, userId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newSupervisors = selectedUsers.map((userId) => {
      const user = userDatabase.find((user) => user.id === userId);
      if (!user) return "";
      return `${user.fio}`;
    });

    const duplicateErrors = {};
    newSupervisors.forEach((supervisorName, index) => {
      if (supervisors.includes(supervisorName)) {
        duplicateErrors[selectedUsers[index]] =
          "Научный руководитель уже добавлен";
      }
    });

    if (Object.keys(duplicateErrors).length > 0) {
      setErrors(duplicateErrors);
      return;
    }

    setErrors({});
    addSelectedUsers(newSupervisors.filter((name) => name));

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
        <h1>База научных руководителей</h1>
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
                    if (!supervisorRefs.current[user.id]) {
                      supervisorRefs.current[user.id] = React.createRef();
                    }
                    return (
                      <CSSTransition
                        key={user.id}
                        timeout={300}
                        classNames="fade"
                        nodeRef={supervisorRefs.current[user.id]}
                      >
                        <div
                          ref={supervisorRefs.current[user.id]}
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
                            {user.job_title || "Не указано"} /{" "}
                            {user.department?.institute || "Не указано"} /{" "}
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
            Добавить научного руководителя
          </MyButton>
        </div>
      </form>
    </div>
  );
};

export default ModalSupervisorsBase;
