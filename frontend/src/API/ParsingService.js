import { fetchData, postData } from "./apiService";

// Функция для запуска парсинга
export const startParsing = async (parsingData) => {
  try {
    const response = await postData("start-parsing/", parsingData);
    console.log("Response from API:", response);
    return response; // Возвращаем успешный ответ
  } catch (error) {
    console.error("Ошибка при запуске парсинга:", error);
    throw new Error(error.message); // Прокидываем ошибку
  }
};

// Получение статуса блокировки
export const getParsingLockStatus = async () => {
  try {
    const data = await fetchData("get-parsing-lock-status/");
    return data;
  } catch (error) {
    console.error("Ошибка при получении статуса блокировки:", error);
    throw new Error("Не удалось получить статус блокировки");
  }
};


export const startImport = async (importData) => {
  console.log("Начало отправки документа...");
  console.log("Отправляемые данные:", importData);

  try {
    const response = await postData("import-form16/", importData);
    console.log("Документ успешно отправлен! Ответ сервера:", response);
    return response;
  } catch (error) {
    console.error("Ошибка при отправке документа:", error);
    throw error;
  }
};

export const addScientificMaterial = async (materialData) => {
  return postData("scientific_materials/", materialData); // Отправляем данные на сервер
};
