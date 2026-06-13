import { postData } from './apiService';

export const addScientificDocument = async (documentData) => {
  console.log('Начало отправки документа...');
  console.log('Отправляемые данные:', documentData);

  try {
    const response = await postData('scientific_materials/', documentData);
    console.log('Документ успешно отправлен! Ответ сервера:', response);
    return response;
  } catch (error) {
    console.error('Ошибка при отправке документа:', error);
    throw error;
  }
};