import { exportPostData } from "./apiService";

export const exportJsonList = async (filteredResultsList) => {
  return await exportPostData("export-json/", { data: filteredResultsList });
};

export const exportJsonForm16Surname = async (filteredResultsForm16Surname) => {
  return await exportPostData("export-json-surname/", { data: filteredResultsForm16Surname });
};

export const exportJsonDepartment = async (filteredResultsDepartment) => {
  return await exportPostData("export-json-department/", { data: filteredResultsDepartment });
};