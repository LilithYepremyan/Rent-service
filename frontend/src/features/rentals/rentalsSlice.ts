import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import axios from "axios";
import type { Cloth } from "../clothes/clothesSlice";
import type { Customer } from "../../components/BookingModal/BookingModal";

export interface Rental {
  id: number;
  clothId: number;
  rentDate: string;
  startDate: string;
  endDate: string;
  status: string;
  // userId: number;
  customer: Customer;
  firstName: string;
  lastName: string;
  phone: string;
  cloth: Cloth;
}

interface RentalsState {
  rentals: Rental[];
  loading: boolean;
}

const initialState: RentalsState = {
  rentals: [],
  loading: false,
};

export const getAllRentals = createAsyncThunk<Rental[], void>(
  "rentals/fetchRentals",
  async () => {
    const response = await axios.get<Rental[]>("http://localhost:5000/rentals");
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
        state.rentals = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(getAllRentals.rejected, (state) => {
      state.loading = false;
    });
  },
});

export default rentalsSlice.reducer;
