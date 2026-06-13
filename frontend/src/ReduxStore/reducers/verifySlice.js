import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import VerifyService from "../../API/VerifyService";
import { fetchFile } from "../../API/apiService";

export const fetchVerifiedWorks = createAsyncThunk(
  "verify/fetchVerifiedWorks",
  async () => {
    const verificationData = await VerifyService.fetchVerificationOfWork();
    const materialsData = await VerifyService.fetchScientificMaterials();
    const humansData = await VerifyService.fetchScientificMaterialsHumans();

    const mergedData = verificationData
      .map((verification) => {
        const material = materialsData.find(
          (mat) => mat.id === verification.work_id
        );
        const authors = humansData
          .filter(
            (human) =>
              human.work === material.id && human.relationship_type === "Автор"
          )
          .map((human) => human.human.fio);

        const supervisors = humansData
          .filter(
            (human) =>
              human.work === material.id &&
              human.relationship_type === "Научный руководитель"
          )
          .map((human) => human.human.fio);

        return {
          ...material,
          is_verified: verification.is_verified,
          authors,
          supervisors,
        };
      })
      .filter(Boolean)
      .filter((work) => !work.is_verified);

    return mergedData;
  }
);

export const verifyDownloadFile = createAsyncThunk(
  "media/verifyDownloadFile",
  async (filePath, { rejectWithValue }) => {
    try {
      const fileUrl = await fetchFile(filePath);
      return fileUrl;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const verifySlice = createSlice({
  name: "verify",
  initialState: {
    verifiedWorks: [],
    isLoading: false,
    error: null,
    downloadFileUrl: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchVerifiedWorks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVerifiedWorks.fulfilled, (state, action) => {
        state.verifiedWorks = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchVerifiedWorks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(verifyDownloadFile.pending, (state) => {
        state.downloadFileUrl = null;
        state.error = null;
      })
      .addCase(verifyDownloadFile.fulfilled, (state, action) => {
        state.downloadFileUrl = action.payload;
      })
      .addCase(verifyDownloadFile.rejected, (state, action) => {
        state.error = action.payload || action.error.message;
      });
  },
});

export default verifySlice.reducer;
