import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addParticipant, checkParticipantExists } from '../../API/ParticipantService';

// Асинхронная операция для проверки дубликатов
export const checkDuplicateParticipantAsync = createAsyncThunk(
    'participants/checkDuplicateParticipantAsync',
    async (participantData, { rejectWithValue }) => {
        try {
            const response = await checkParticipantExists(participantData);  // Запрос на сервер
            const existingParticipant = response.find(participant =>
                participant.last_name === participantData.surname &&
                participant.first_name === participantData.name &&
                participant.middle_name === participantData.middlename &&
                participant.birth_date === participantData.birthdate
            );

            return existingParticipant ? true : false;  // Если найден дубликат, возвращаем true
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const addNewParticipant = createAsyncThunk(
    'participants/addNewParticipant',
    async (participantData, { rejectWithValue }) => {
        try {
            const response = await addParticipant(participantData);  // Добавление нового участника
            return response;
        } catch (error) {
            return rejectWithValue(error);
        }
    }
);

const participantsSlice = createSlice({
    name: 'participants',
    initialState: {
        participantsList: [],
        loading: false,
        error: null,
    },
    extraReducers: (builder) => {
        builder
            .addCase(addNewParticipant.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addNewParticipant.fulfilled, (state, action) => {
                state.loading = false;
                state.participantsList.push(action.payload);
            })
            .addCase(addNewParticipant.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(checkDuplicateParticipantAsync.fulfilled, (state, action) => {
                // Просто возвращаем результат проверки, без сохранения ошибки в стейте
            });
    },
});

export default participantsSlice.reducer;
