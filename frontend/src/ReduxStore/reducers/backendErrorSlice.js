import { createSlice } from "@reduxjs/toolkit";

const backendErrorSlice = createSlice({
  name: "backendError",
  initialState: {
    message: "",
  },
  reducers: {
    setBackendError: (state, action) => {
      state.message = action.payload;
    },
    clearBackendError: (state) => {
      state.message = "";
    },
  },
});

export const { setBackendError, clearBackendError } = backendErrorSlice.actions;
export default backendErrorSlice.reducer;