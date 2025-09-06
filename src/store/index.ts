import { configureStore } from '@reduxjs/toolkit';
import participantReducer from './slices/participantSlice';
import assessmentReducer from './slices/assessmentSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    participant: participantReducer,
    assessment: assessmentReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
