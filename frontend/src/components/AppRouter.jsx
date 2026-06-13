import React, { useEffect } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../ReduxStore/selectors/authSelectors";
import { headOfDepartmentRoutes, teacherRoutes, publicRoutes } from "../router";
import Error from "../pages/Error";
import { getUser } from "../ReduxStore/reducers/authSlice";

const AppRouter = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
   const location = useLocation();

  useEffect(() => {
    dispatch(getUser());
  }, [dispatch]);

  const getRoutesByRole = (role) => {
    switch (role) {
      case "Заведующие кафедрой":
        return headOfDepartmentRoutes;
      case "Преподаватели":
        return teacherRoutes;
      default:
        return publicRoutes;
    }
  };

    // Добавляем проверку для избежания бесконечного редиректа
  if (location.pathname === "/") {
    return <Navigate to="/about" replace />;
  }

  return (
    <Routes>
      {getRoutesByRole(user?.role).map((route) => (
        <Route key={route.path} path={route.path} element={route.element} exact={route.exact} />
      ))}

      <Route path="/" element={<Navigate to="/about" replace />} />
      <Route path="*" element={<Error />} />
    </Routes>
  );
};

export default AppRouter;
