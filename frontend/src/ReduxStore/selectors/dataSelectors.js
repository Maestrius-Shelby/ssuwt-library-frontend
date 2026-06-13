import { createSelector } from "reselect";

const selectDataDomain = (state) => state.data;
const selectAuthDomain = (state) => state.auth;

export const makeSelectData = createSelector(
  [selectDataDomain, selectAuthDomain],
  (dataState, authState) => ({
    institutesList: dataState.institutesData,
    departmentList: dataState.departmentData,
    userDatabase: dataState.humanData,
    ratingList: dataState.ratingData,
    publicationTypeList: dataState.publicationTypeData,
    statisticsList: dataState.statistics,
    currentUser: dataState.currentUserData,
    userId: authState.user?.user_id,
    isLoading: dataState.isLoading,
    avatarUrl: dataState.avatarUrl,
    downloadFileUrl: dataState.downloadFileUrl,
  })
);
