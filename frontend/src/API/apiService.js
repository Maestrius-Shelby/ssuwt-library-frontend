import axiosInstance, { mediaAxiosInstance } from "./axiosInstance";

export const fetchData = async (endpoint) => {
  try {
    const response = await axiosInstance.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error.response?.data || error.message || "Ошибка подключения";
  }
};

export const postData = async (endpoint, data) => {
  try {
    const response = await axiosInstance.post(endpoint, data);
    return response.data;
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    throw error.response?.data || error.message || "Ошибка подключения";
  }
};

export const exportPostData = async (endpoint, data) => {
  try {
    const response = await axiosInstance.post(endpoint, data, {
      responseType: "blob",
    });
    return response;
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    throw error.response?.data || error.message || "Ошибка подключения";
  }
};

export const fetchAvatar = async (avatarPath) => {
  try {
    const response = await mediaAxiosInstance.get(avatarPath, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Ошибка загрузки аватара:", error);
    return null;
  }
};

export const fetchFile = async (filePath) => {
  try {
    const response = await mediaAxiosInstance.get(filePath, {
      responseType: "blob",
    });
    return URL.createObjectURL(response.data);
  } catch (error) {
    console.error("Ошибка при скачивании файла:", error);
    return null;
  }
};
