import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import axios from "axios";

export interface Rental {
  id: number;
  clothId: number;
  rentDate: string;
  startDate: string;
  endDate: string;
  status: string;
  userId: number;
  firstName: string;
  lastName: string;
  phone: string;
}

interface RentalsState {
  items: Rental[];
  loading: boolean;
}

const initialState: RentalsState = {
  items: [],
  loading: false,
};

export const getAllRentals = createAsyncThunk(
  "rentals/fetchRentals",
  async () => {
    const response = await axios.get<Rental[]>("http://localhost:5000/rentals");

    console.log("11111 rentals:", response.data);
    return response.data;
  }
);

const rentalsSlice = createSlice({
  name: "rentals",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllRentals.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getAllRentals.fulfilled,
      (state, action: PayloadAction<Rental[]>) => {
        state.items = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(getAllRentals.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default rentalsSlice.reducer;
