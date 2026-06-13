import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./reducers/authSlice";
import participantsReducer from "./reducers/participantsSlice";
import dataReducer from "./reducers/dataSlice";
import parsingReducer from "./reducers/parsingSlice";
import exportReducer from "./reducers/exportSlice";
import documentReducer from "./reducers/documentSlice";
import serverStatusReducer from "./reducers/serverStatusSlice";
import backendErrorReducer from "./reducers/backendErrorSlice";
import frontendErrorRecucer from "./reducers/frontendErrorSlice";
import verifyReducer from "./reducers/verifySlice";
import personalReducer from "./reducers/personalSlice";
// import timerMiddleware from './middlewares/timerMiddleware';

const store = configureStore({
  reducer: {
    auth: authReducer,
    participants: participantsReducer,
    data: dataReducer,
    parsing: parsingReducer,
    export: exportReducer,
    document: documentReducer,
    serverStatus: serverStatusReducer,
    backendError: backendErrorReducer,
    frontendError: frontendErrorRecucer,
    verify: verifyReducer,
    personal: personalReducer,
  },
  // middleware: getDefaultMiddleware => getDefaultMiddleware().concat(timerMiddleware),
});

export default store;
