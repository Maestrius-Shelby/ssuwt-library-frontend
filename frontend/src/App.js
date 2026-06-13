import React from "react";
import "./styles/App.css";
import { BrowserRouter } from "react-router-dom";
import Header from "./components/UI/Header/header";
import Sidebar from "./components/UI/Sidebar/Sidebar";
import Content from "./components/UI/Content/content";
import AuthProvider from "./components/AuthProvider";
import FrontendServerError from "./components/UI/FrontendServerError/FrontendServerError";
import { useSelector } from "react-redux";
import BackendServerError from "./components/UI/BackendServerError/BackendServerError";
import { selectBackendError } from "./ReduxStore/selectors/backendErrorSelectors";

function App() {
  const backendError = useSelector(selectBackendError);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <FrontendServerError />
        <div className="grid-container">
          <Header />
          {backendError ? (
            <BackendServerError message={backendError} />
          ) : (
            <Content />
          )}
          <Sidebar />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;