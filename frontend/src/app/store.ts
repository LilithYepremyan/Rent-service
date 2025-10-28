import { configureStore } from "@reduxjs/toolkit";
import clothesReducer from "../features/clothes/clothesSlice";
import rentalsReducer from "../features/rentals/rentalsSlice";

export const store = configureStore({
  reducer: {
    clothes: clothesReducer,
    rentals: rentalsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
