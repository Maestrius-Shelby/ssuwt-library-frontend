import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PersonalService from "../../API/PersonalService";

export const fetchScientificMaterialsStatistics = createAsyncThunk(
  "personal/fetchScientificMaterialsStatistics",
  async () => {
    const response = await PersonalService.fetchScientificMaterialsStatistics();
    return response;
  }
);

export const fetchScientificMaterialsForPerson = createAsyncThunk(
    "personal/fetchScientificMaterialsForPerson",
    async () => {
      const response = await PersonalService.fetchScientificMaterialsForPerson();
      return response;
    }
  );

const personalSlice = createSlice({
  name: "personal",
  initialState: {
    scientificMaterials: [],
    scientificMaterialsStatistics: {
      scientific_materials_count: 0,
      scientific_materials_rating_count: 0,
      scientific_materials_supervisor_count: 0,
    },
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchScientificMaterialsStatistics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchScientificMaterialsStatistics.fulfilled, (state, action) => {
        state.scientificMaterialsStatistics = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchScientificMaterialsStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchScientificMaterialsForPerson.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchScientificMaterialsForPerson.fulfilled, (state, action) => {
        state.scientificMaterials = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchScientificMaterialsForPerson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      });
      
  },
});

export default personalSlice.reducer;