import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../utils/api';

// Action asynchrone pour récupérer les animaux
export const fetchAnimals = createAsyncThunk(
    'animals/fetchAnimals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/animaux'); // Endpoint MockAPI
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

const initialState = {
    animals: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const animalsSlice = createSlice({
    name: 'animals',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(fetchAnimals.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAnimals.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.animals = action.payload;
            })
            .addCase(fetchAnimals.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export default animalsSlice.reducer;
