import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { addScientificDocument } from "../../API/DocumentService";

export const submitDocument = createAsyncThunk(
  "document/submitDocument",
  async (documentData, { rejectWithValue }) => {
    try {
      const response = await addScientificDocument(documentData);
      console.log("API Response:", response);
      return response;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Ошибка при отправке данных"
      );
    }
  }
);

const documentSlice = createSlice({
  name: "document",
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(submitDocument.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitDocument.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        console.log("State updated with:", state.data);
      })
      .addCase(submitDocument.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default documentSlice.reducer;
