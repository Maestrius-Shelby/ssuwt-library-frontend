import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  exportJsonDepartment,
  exportJsonForm16Surname,
  exportJsonList,
} from "../../API/ExportService";

export const getExportList = createAsyncThunk(
  "export/getExportList",
  async (filteredResultsList, { rejectWithValue }) => {
    try {
      const response = await exportJsonList(filteredResultsList);

      if (!response.status === 200) {
        throw new Error("Ошибка при обработке данных на сервере");
      }

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      return url;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getExportForm16Surname = createAsyncThunk(
  "export/getExportForm16Surname",
  async (filteredResultsForm16Surname, { rejectWithValue }) => {
    try {
      const response = await exportJsonForm16Surname(
        filteredResultsForm16Surname
      );

      if (!response.status === 200) {
        throw new Error("Ошибка при обработке данных на сервере");
      }

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      return url;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getExportDepartment = createAsyncThunk(
  "export/getExportDepartment",
  async (filteredResultsDepartment, { rejectWithValue }) => {
    try {
      const response = await exportJsonDepartment(
        filteredResultsDepartment
      );

      if (!response.status === 200) {
        throw new Error("Ошибка при обработке данных на сервере");
      }

      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      return url;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const exportSlice = createSlice({
  name: "export",
  initialState: {
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getExportList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExportList.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getExportList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getExportForm16Surname.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExportForm16Surname.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getExportForm16Surname.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getExportDepartment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExportDepartment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getExportDepartment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default exportSlice.reducer;
