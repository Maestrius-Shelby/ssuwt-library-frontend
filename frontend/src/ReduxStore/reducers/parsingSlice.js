import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  addScientificMaterial,
  startParsing,
  startImport,
  getParsingLockStatus,
} from "../../API/ParsingService";

// Асинхронный экшен для добавления работы
export const addScientificMaterialAsync = createAsyncThunk(
  "parsing/addScientificMaterialAsync", // Имя экшена
  async (materialData, { rejectWithValue }) => {
    try {
      const response = await addScientificMaterial(materialData); // Вызов API
      return response; // Возвращаем результат
    } catch (error) {
      console.error("Ошибка при добавлении работы:", error);
      return rejectWithValue(error.message); // Обработка ошибки
    }
  }
);

// Асинхронный экшен для запуска парсинга
export const startParsingProcess = createAsyncThunk(
  "parsing/startParsingProcess", // Имя экшена
  async (parsingData, { rejectWithValue }) => {
    try {
      const response = await startParsing(parsingData); // Вызов API
      return response; // Возвращаем успешный ответ
    } catch (error) {
      console.error("Ошибка при запуске парсинга:", error);
      return rejectWithValue(error.message); // Обработка ошибки
    }
  }
);

export const fetchParsingLockStatus = createAsyncThunk(
  "parsing/fetchParsingLockStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getParsingLockStatus();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Асинхронный экшен для запуска импорта
export const startImportProcess = createAsyncThunk(
  "import/startImportProcess", // Имя экшена
  async (importData, { rejectWithValue }) => {
    try {
      const response = await startImport(importData); // Вызов API
      return response; // Возвращаем успешный ответ
    } catch (error) {
      console.error("Ошибка при запуске парсинга:", error);
      return rejectWithValue(error.message); // Обработка ошибки
    }
  }
);

const initialState = {
  loading: false,
  data: JSON.parse(localStorage.getItem("parsingData")) || null,
  materials: JSON.parse(localStorage.getItem("scientificMaterials")) || [],
  error: null,
  isParsingStarted: false,
  lockStatus: null,
  isImportStarted: false, // Новое состояние для импорта
};

const parsingSlice = createSlice({
  name: "parsing",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null; // Сброс ошибки
    },
    resetParsing: (state) => {
      state.isParsingStarted = false; // Сброс состояния парсинга
    },
    resetImport: (state) => {
      state.isImportStarted = false; // Сброс состояния импорта
    },
  },
  extraReducers: (builder) => {
    builder
      // Обработка экшена добавления работы
      .addCase(addScientificMaterialAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addScientificMaterialAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.materials.push(action.payload); // Добавляем новую работу
        localStorage.setItem(
          "scientificMaterials",
          JSON.stringify(state.materials)
        ); // Обновляем localStorage
      })
      .addCase(addScientificMaterialAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Сохраняем ошибку
      })
      // Обработка экшена запуска парсинга
      .addCase(startParsingProcess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startParsingProcess.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isParsingStarted = true;
        localStorage.setItem("parsingData", JSON.stringify(action.payload));
      })
      .addCase(startParsingProcess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchParsingLockStatus.fulfilled, (state, action) => {
        state.lockStatus = action.payload;
      })
      .addCase(fetchParsingLockStatus.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Запуск импорта
      .addCase(startImportProcess.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startImportProcess.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isImportStarted = true;
        localStorage.setItem("parsingData", JSON.stringify(action.payload));
      })
      .addCase(startImportProcess.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetError, resetParsing, resetImport } = parsingSlice.actions;
export default parsingSlice.reducer;
