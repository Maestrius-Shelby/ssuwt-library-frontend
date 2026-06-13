import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchScientificMaterialsStatistics } from "../../../ReduxStore/reducers/personalSlice";
import {
  selectScientificMaterialsStatistics,
} from "../../../ReduxStore/selectors/personalSelectors";
import styles from './InfoCards.module.css';

const InfoCards = () => {
  const dispatch = useDispatch();
  const scientificMaterialsStatistics = useSelector(selectScientificMaterialsStatistics);

  useEffect(() => {
    dispatch(fetchScientificMaterialsStatistics());
  }, [dispatch]);

  return (
    <div className={styles.cardsContainer}>
      <div className={styles.card}>
        <h3>Загруженные научные работы</h3>
        <div className={styles.cardContent}>
          <div className={styles.raitingnumber}>
            <span className={styles.cardValue}>
              {scientificMaterialsStatistics.scientific_materials_count}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.card}>
        <h3>Публикации в РИНЦ</h3>
        <div className={styles.cardContent}>
          <div className={styles.raitingnumber}>
            <span className={styles.cardValue}>
              {scientificMaterialsStatistics.scientific_materials_rating_count}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.card}>
        <h3>Работы под руководством</h3>
        <div className={styles.cardContent}>
          <div className={styles.raitingnumber}>
            <span className={styles.cardValue}>
              {scientificMaterialsStatistics.scientific_materials_supervisor_count}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCards;