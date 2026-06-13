import React from "react";
import MainSearch from "../components/UI/Search/MainSearch";
import Statistics from "../components/UI/Statistics/Statistics";

const About = () => {
  return (
    <div>
      <div className="aboutcontainer">
        <MainSearch />
        <div className="about">
          <h2>О платформе</h2>

          <div className="contentText">
            <span style={{ color: "#003366", fontWeight: "600" }}>
              Научная библиотека СГУВТ{" "}
            </span>{" "}
            — ваш доступ к архиву научных и учебных материалов Сибирского
            государственного университета водного транспорта. Здесь вы можете
            искать и просматривать статьи, доклады и учебные пособия. Удобный
            поиск позволит быстро найти нужные материалы для учебной и научной
            деятельности.
          </div>

          <div style={{ margin: "40px 0" }}>
            <hr className="blueLine"></hr>
          </div>
          <Statistics />
        </div>
      </div>
    </div>
  );
};

export default About;