import { postData, fetchData } from './apiService';

export const addParticipant = async (participantData) => {
    return postData('human/', participantData);
};

export const checkParticipantExists = async (participantData) => { 
    const { surname, name, middlename, birthdate } = participantData;
    try {
        const response = await fetchData(`human/?fio=${surname} ${name} ${middlename}&birthdate=${birthdate}`);
        return response;  // Возвращаем данные, с которыми будем работать в слайсе
    } catch (error) {
        console.error('Error checking participant:', error);
        throw error;
    }
};