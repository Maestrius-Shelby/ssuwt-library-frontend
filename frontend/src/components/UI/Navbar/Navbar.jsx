import React from 'react';

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-border">
        <p>Навигация</p>
        <ul className="navigation-navbar">
          <li><a href="">Статьи</a></li>
          <li><a href="">Издатели</a></li>
          <li><a href="">Отчеты</a></li>
          <li><a href="">Преподаватели</a></li>
        </ul>
      </div>
    </div>
  );
}

export default Navbar;
