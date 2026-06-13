import React from "react";
import styles from "./IsLoadingParsing.module.css";

const IsLoadingParsing = () => {
  return (
    <div className={styles.scene}>
      <div className={styles.objects}>
        <div className={styles.square}></div>
        <div className={styles.circle}></div>
        <div className={styles.triangle}></div>
      </div>
      <div className={styles.wizard}>
        <div className={styles.body}></div>
        <div className={styles.rightArm}>
          <div className={styles.rightHand}></div>
        </div>
        <div className={styles.leftArm}>
          <div className={styles.leftHand}></div>
        </div>
        <div className={styles.head}>
        <div className={styles.bald}></div> {/* Добавление лысины */}
          <div className={styles.beard}></div>
          <div className={styles.face}>
            <div className={styles.adds}></div>
          </div>
          
          {/* <div className={styles.hat}>
            <div className={styles.hatOfTheHat}></div>
            <div className={`${styles.fourPointStar} ${styles.first}`}></div>
            <div className={`${styles.fourPointStar} ${styles.second}`}></div>
            <div className={`${styles.fourPointStar} ${styles.third}`}></div>
          </div> */}
          
        </div>
      </div>
      {/* <div className={styles.progress}></div> */}
    </div>
  );
};

export default IsLoadingParsing;