import { configureStore } from '@reduxjs/toolkit';
import animalsReducer from './animalsSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    animals: animalsReducer,
    users: usersReducer,
  },
});
