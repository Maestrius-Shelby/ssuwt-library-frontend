import { createSlice } from "@reduxjs/toolkit";

const serverStatusSlice = createSlice({
  name: "serverStatus",
  initialState: { 
    isBackendDown: false,  // Состояние для бэкенда
    isFrontendDown: false    // Состояние для клиента
  },
  reducers: {
    setBackendDown: (state) => {
      state.isBackendDown = true;
    },
    setBackendUp: (state) => {
      state.isBackendDown = false;
    },
    setFrontendDown: (state) => {
      state.isFrontendDown = true;
    },
    setFrontendUp: (state) => {
      state.isFrontendDown = false;
    },
  },
});

export const { setBackendDown, setBackendUp, setFrontendDown, setFrontendUp } = serverStatusSlice.actions;
export default serverStatusSlice.reducer;
