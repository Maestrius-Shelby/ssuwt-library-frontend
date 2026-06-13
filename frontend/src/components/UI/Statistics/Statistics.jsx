import React, { useEffect } from "react";
import styles from "./Statistics.module.css";
import { useDispatch, useSelector } from "react-redux";
import { fetchStatistics } from "../../../ReduxStore/reducers/dataSlice";
import { makeSelectData } from "../../../ReduxStore/selectors/dataSelectors";

const Statistics = () => {
    const dispatch = useDispatch();
    const { statisticsList } = useSelector(makeSelectData);

    useEffect(() => {
        dispatch(fetchStatistics());
    }, [dispatch]);

    return (
        <div className={styles.contentText}>
            <div className={styles.contentTitle}>Статистика</div>
            <p>Число добавленных авторов: {statisticsList?.["Число добавленных авторов"]}</p>
            <p>Загружено научных статей: {statisticsList?.["Всего статей"]}</p>
            <p className={styles.indented}>Из них ВАК: {statisticsList?.["ВАК"]}</p>
            <p className={styles.indented}>Из них РИНЦ: {statisticsList?.["РИНЦ"]}</p>
            <p className={styles.indented}>Из них Зарубежное: {statisticsList?.["Зарубежное"]}</p>
            <p className={styles.indented}>Из них Elibrary: {statisticsList?.["Elibrary"]}</p>
            <p>Загружено внутренней литературы: {statisticsList?.["Внутреннее"]}</p>  
        </div>
    );
};

export default Statistics;