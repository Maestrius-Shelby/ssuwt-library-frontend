import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import PostService from "../../API/PostService";
import { fetchAvatar, fetchFile } from "../../API/apiService";

// Асинхронные действия для получения данных
export const fetchInitialData = createAsyncThunk(
  "data/fetchInitialData",
  async () => {
    const [
      humanData,
      departmentData,
      institutesData,
      ratingData,
      publicationTypeData,
      relationshipData,
      jobTitleListData,
    ] = await Promise.all([
      PostService.fetchHuman(),
      PostService.fetchDepartment(),
      PostService.fetchInstitutes(),
      PostService.fetchRating(),
      PostService.fetchPublicationType(),
      PostService.fetchRelationshipType(),
      PostService.fetchJobTitle(),
    ]);

    return {
      humanData,
      departmentData,
      institutesData,
      ratingData,
      publicationTypeData,
      relationshipData,
      jobTitleListData,
    };
  }
);

export const searchScientificMaterials = createAsyncThunk(
  "data/searchScientificMaterials",
  async (filters) => {
    const results = await PostService.searchScientificMaterials(filters);
    return results;
  }
);

export const mainSearchScientificMaterials = createAsyncThunk(
  "data/mainSearchScientificMaterials",
  async (filters) => {
    const results = await PostService.mainSearchScientificMaterials(filters);
    return results;
  }
);

export const addScientificMaterials = createAsyncThunk(
  "data/addScientificMaterials",
  async (filters) => {
    const results = await PostService.addScientificMaterials(filters);
    return results;
  }
);

export const fetchStatistics = createAsyncThunk(
  "data/fetchStatistics",
  async () => {
    const response = await PostService.fetchStatistics();
    console.log("Статистика API:", response); // <== Посмотрим, что приходит
    return response["Статистика"][0];
  }
);

export const fetchHumanByUserId = createAsyncThunk(
  "data/fetchHumanByUserId",
  async (userId, { rejectWithValue }) => {
    try {
      const allHumans = await PostService.fetchHuman();

      const currentUser = allHumans.find((human) => human.user === userId);

      return currentUser || rejectWithValue("Пользователь не найден");
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAvatarAPI = createAsyncThunk(
  "data/fetchAvatarAPI",
  async (avatarPath, { rejectWithValue }) => {
    try {
      const avatarUrl = await fetchAvatar(avatarPath);
      return avatarUrl;
    } catch (error) {
      return rejectWithValue(error.message || error.toString());
    }
  }
);

export const downloadFile = createAsyncThunk(
  "media/downloadFile",
  async (filePath, { rejectWithValue }) => {
    try {
      const fileUrl = await fetchFile(filePath);
      return fileUrl;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dataSlice = createSlice({
  name: "data",
  initialState: {
    humanData: [],
    departmentData: [],
    institutesData: [],
    ratingData: [],
    publicationTypeData: [],
    relationshipData: [],
    jobTitleListData: [],
    searchResults: [],
    statistics: null,
    searchPerformed: false,
    isLoading: false,
    currentUserData: null,
    error: null,
    avatarUrl: null,
    downloadFileUrl: null,
  },
  reducers: {
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
    },
    setSearchPerformed: (state, action) => {
      state.searchPerformed = action.payload;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload; // Устанавливаем состояние isLoading
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInitialData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchInitialData.fulfilled, (state, action) => {
        const {
          humanData,
          departmentData,
          institutesData,
          ratingData,
          publicationTypeData,
          relationshipData,
          jobTitleListData,
        } = action.payload;

        state.humanData = humanData;
        state.departmentData = departmentData;
        state.institutesData = institutesData;
        state.ratingData = ratingData;
        state.publicationTypeData = publicationTypeData;
        state.relationshipData = relationshipData;
        state.jobTitleListData = jobTitleListData;
        state.isLoading = false;
      })
      .addCase(fetchInitialData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(searchScientificMaterials.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.searchPerformed = true;
      })
      .addCase(mainSearchScientificMaterials.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.searchPerformed = true;
      })
      .addCase(addScientificMaterials.fulfilled, (state, action) => {
        console.log("Scientific materials added:", action.payload);
      })
      .addCase(fetchStatistics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchStatistics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchHumanByUserId.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchHumanByUserId.fulfilled, (state, action) => {
        state.currentUserData = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchHumanByUserId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(fetchAvatarAPI.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAvatarAPI.fulfilled, (state, action) => {
        state.avatarUrl = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchAvatarAPI.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error.message;
      })
      .addCase(downloadFile.pending, (state) => {
        state.downloadUrl = null;
        state.error = null;
      })
      .addCase(downloadFile.fulfilled, (state, action) => {
        state.downloadUrl = action.payload;
      })
      .addCase(downloadFile.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export const { setSearchResults, setSearchPerformed, setIsLoading } =
  dataSlice.actions;
export default dataSlice.reducer;
