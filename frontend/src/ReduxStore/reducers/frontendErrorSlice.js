import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null, // Изначально ошибки нет
};

const frontendErrorSlice = createSlice({
  name: 'FrontendError',
  initialState,
  reducers: {
    setFrontendError: (state, action) => {
      state.message = action.payload; // Записываем сообщение ошибки
    },
    clearFrontendError: (state) => {
      state.message = null; // Очищаем ошибку
    },
  },
});

export const { setFrontendError, clearFrontendError } = frontendErrorSlice.actions;
export default frontendErrorSlice.reducer;
