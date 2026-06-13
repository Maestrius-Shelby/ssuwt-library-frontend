import React, { useEffect } from "react";
import styles from "./PersonalPNP.module.css";
import { useDispatch, useSelector } from "react-redux";
import { makeSelectData } from "../../../ReduxStore/selectors/dataSelectors";
import {
  fetchAvatarAPI,
  fetchHumanByUserId,
} from "../../../ReduxStore/reducers/dataSlice";
import IsLoading from "../IsLoading/IsLoading";

const PersonalPNP = () => {
  const dispatch = useDispatch();
  const { currentUser, userId, isLoading, avatarUrl } =
    useSelector(makeSelectData);

  useEffect(() => {
    if (userId && !currentUser) {
      dispatch(fetchHumanByUserId(userId));
    }
  }, [userId, currentUser, dispatch]);

  useEffect(() => {
    if (currentUser?.avatar) {
      dispatch(fetchAvatarAPI(currentUser.avatar));
    }
  }, [currentUser?.avatar, dispatch]);

  return (
    <div>
      <div className={styles.container}>
        <div className={styles.avatar}>
          {isLoading ? (
            <div className={styles.loadingContainer}>
              <IsLoading />
            </div>
          ) : avatarUrl ? (
            <img
              src={avatarUrl}
              alt="User Avatar"
              className={styles.avatarImage}
              onError={(e) => {
                console.error("Image failed to load:", e.target.src);
                e.target.style.display = "none";
              }}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <span>Фото профиля отсутсвует</span>
            </div>
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.label}>ФИО:</span>
          <h2 className={styles.name}>
            {currentUser?.last_name} {currentUser?.first_name}{" "}
            {currentUser?.middle_name}
          </h2>
          <div className={styles.label}>Должность</div>
          <p className={styles.position}>{currentUser?.job_title}</p>
          <div className={styles.label}>Институт / Кафедра</div>
          <p className={styles.description}>
            {" "}
            {currentUser?.department.institute} / {currentUser?.department.name}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalPNP;