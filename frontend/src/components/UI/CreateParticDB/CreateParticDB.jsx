import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewParticipant,
  checkDuplicateParticipantAsync,
} from "../../../ReduxStore/reducers/participantsSlice";
import { fetchInitialData } from "../../../ReduxStore/reducers/dataSlice";
import styles from "./CreateParticDB.module.css";
import NotificationSuccess from "../NotificationSuccess/NotificationSuccess";
import NotificationError from "../NotificationError/NotificationError";
import MyButton from "../button/MyButton";

const CreateParticDB = () => {
  const [form, setForm] = useState({
    surname: "",
    name: "",
    middlename: "",
    birthdate: "",
    postteacher: "",
    department: "",
    institutes: "",
  });
  const [errors, setErrors] = useState({});
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [showNotificationSuccess, setShowNotificationSuccess] = useState(false);
  const [showNotificationError, setShowNotificationError] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInitialData());
  }, [dispatch]);

  // Получаем данные из Redux-хранилища
  const jobTitleList = useSelector((state) => state.data.jobTitleListData);
  const departmentList = useSelector((state) => state.data.departmentData);
  const institutesList = useSelector((state) => state.data.institutesData);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["surname", "name", "middlename"].includes(name) && value.length > 50) {
      return;
    }

    if (name === "birthdate") {
      const year = value.split("-")[0];
      const updatedDate = value.slice(0, 4);

      if (year.length > 4) {
        setForm((prevForm) => ({
          ...prevForm,
          [name]: updatedDate,
        }));
        return;
      }
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

  const validateField = (name, value) => {
    setErrors((prevErrors) => {
      const newErrors = { ...prevErrors };

      if (name === "surname" || name === "name") {
        const cyrillicPattern = /^[А-Яа-яЁё\s-]+$/;
        if (!value) {
          newErrors[name] = "Заполните поле";
        } else if (!cyrillicPattern.test(value)) {
          newErrors[name] = "Используйте только кириллицу без цифр и латиницы";
        } else {
          delete newErrors[name];
        }
      } else if (name === "birthdate") {
        if (!value) {
          newErrors[name] = "Укажите дату";
        } else {
          delete newErrors[name];
        }
      } else if (
        name === "postteacher" ||
        name === "institutes" ||
        name === "department"
      ) {
        if (!value) {
          newErrors[name] = "Выберите один из пунктов списка";
        } else {
          delete newErrors[name];
        }
      }

      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    const selectFields = new Set(["institutes", "department", "postteacher"]);

    // Регулярное выражение для проверки кириллицы
    const cyrillicRegex = /^[А-Яа-яЁё]+$/;

    for (const [key, value] of Object.entries(form)) {
      if (selectFields.has(key)) {
        if (!value) {
          newErrors[key] = "Выберите один из пунктов списка";
        }
      } else if (!value) {
        if (key === "birthdate") {
          newErrors[key] = "Укажите дату";
        } else if (key !== "middlename") {
          // Исключаем отчество из обязательных полей
          newErrors[key] = "Заполните поле";
        }
      } else if (
        (key === "surname" || key === "name") &&
        !cyrillicRegex.test(value)
      ) {
        // Проверка для фамилии и имени
        newErrors[key] = "Используйте только кириллицу без цифр и латиницы";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Валидация формы перед проверкой дубликатов
    if (!validateForm()) {
      return;
    }

    // Проверяем на дубликат на сервере
    try {
      const participantData = {
        surname: form.surname,
        name: form.name,
        middlename: form.middlename,
        birthdate: form.birthdate,
      };

      // Вызываем проверку на сервере
      const existsDuplicate = await dispatch(
        checkDuplicateParticipantAsync(participantData)
      ).unwrap();

      if (existsDuplicate) {
        setShowNotificationError(true); // Показываем уведомление
        setTimeout(() => setShowNotificationError(false), 3000); // Скрываем уведомление через 3 секунды
        return;
      }
    } catch (error) {
      console.error("Ошибка при проверке дубликатов:", error);
      alert("Ошибка при проверке дубликатов");
      return;
    }

    // Валидация формы перед отправкой
    try {
      const getShortFio = (surname, name, middlename) => {
        const shortName = name ? `${name[0]}.` : "";
        const shortMiddlename = middlename ? `${middlename[0]}.` : "";
        return `${surname} ${shortName} ${shortMiddlename}`.trim();
      };

      const requestData = {
        fio: getShortFio(form.surname, form.name, form.middlename),
        last_name: form.surname,
        first_name: form.name,
        middle_name: form.middlename || null, // Если отчество пустое, передаем null
        birth_date: form.birthdate,
        department: parseInt(form.department, 10),
        job_title: parseInt(form.postteacher, 10),
      };

      const existsParticipant = await dispatch(
        addNewParticipant(requestData)
      ).unwrap();

      if (existsParticipant) {
        setShowNotificationSuccess(true); // Показываем уведомление
        setTimeout(() => setShowNotificationSuccess(false), 3000); // Скрываем уведомление через 3 секунды
        return;
      }
    } catch (error) {
      alert(`Ошибка: ${error.message}`);
    } finally {
      // Очистка полей после отправки
      setForm({
        surname: "",
        name: "",
        middlename: "",
        birthdate: "",
        postteacher: "",
        department: "",
        institutes: "",
      });

      // Очистка ошибок (если были)
      setErrors({});
    }
  };

  useEffect(() => {
    if (form.institutes) {
      const selectedInstituteName = institutesList.find(
        (institute) => institute.id === parseInt(form.institutes, 10)
      )?.name;
      if (selectedInstituteName) {
        setFilteredDepartments(
          departmentList.filter(
            (dept) => dept.institute === selectedInstituteName
          )
        );
      }
    } else {
      setFilteredDepartments([]);
    }
  }, [form.institutes, institutesList, departmentList]);

  return (
    <div className={styles.container}>
      <div className={styles.toptext}>
        <h1>Добавление участника</h1>
        <p>
          После отправки данные участника будут сохранены в базе, что позволит
          добавить его в работу.
        </p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.horizontalGroup}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Фамилия<span className={styles.required}> *</span>
            </label>
            <input
              type="text"
              name="surname"
              value={form.surname}
              onChange={handleChange}
              className={`${styles.input} ${
                errors.surname ? styles.error : ""
              }`}
              title="Используйте только буквы"
            />
            {errors.surname && (
              <span className={styles.errorMessage}>{errors.surname}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Имя<span className={styles.required}> *</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`${styles.input} ${errors.name ? styles.error : ""}`}
              title="Используйте только буквы"
            />
            {errors.name && (
              <span className={styles.errorMessage}>{errors.name}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Отчество</label>
            <input
              type="text"
              name="middlename"
              value={form.middlename}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>
        <div className={styles.formWrapper}>
          <div className={styles.column}>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Дата рождения<span className={styles.required}> *</span>
              </label>
              <input
                type="date"
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
                className={`${styles.input} ${
                  errors.birthdate ? styles.error : ""
                }`}
              />
              {errors.birthdate && (
                <span className={styles.errorMessage}>{errors.birthdate}</span>
              )}
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Должность<span className={styles.required}> *</span>
              </label>
              <select
                name="postteacher"
                value={form.postteacher}
                onChange={handleChange}
                className={`${styles.select} ${
                  errors.postteacher ? styles.error : ""
                }`}
              >
                <option value="">Выбор из списка</option>
                {jobTitleList.map((postteacher) => (
                  <option key={postteacher.id} value={postteacher.id}>
                    {postteacher.name}
                  </option>
                ))}
              </select>
              {errors.postteacher && (
                <span className={styles.errorMessage}>
                  {errors.postteacher}
                </span>
              )}
            </div>
          </div>

          <div className={styles.column}>
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
        </div>
        <div className={styles.buttomContainer}>
          <MyButton type="submit">Добавить</MyButton>
          <p className={styles.pst}>
            Поле со звёздочкой ( * ) является обязательным к заполнению
          </p>
        </div>
      </form>

      <NotificationError
        message="Данные участника уже существуют!"
        show={showNotificationError}
      />

      <NotificationSuccess
        message="Участник был успешно добавлен!"
        show={showNotificationSuccess}
      />
    </div>
  );
};

export default CreateParticDB;
