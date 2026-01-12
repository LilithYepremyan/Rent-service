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
  todayEndingRentals: Rental[];
  rentalsByDate: Rental[];
  cleaningsRentalsByDate: Rental[];
  endingRentalsByDate: Rental[];
  totalDeposit: number;
  loading: boolean;
}

const initialState: RentalsState = {
  rentals: [],
  todayEndingRentals: [],
  rentalsByDate: [],
  cleaningsRentalsByDate: [],
  endingRentalsByDate: [],
  totalDeposit: 0,
  loading: false,
};

interface TodayRentalsResponse {
  rentals: Rental[];
  totalDeposit: number;
}

export const getAllRentals = createAsyncThunk<Rental[], void>(
  "rentals/fetchRentals",
  async () => {
    const response = await axios.get<Rental[]>("http://localhost:5000/rentals");
    return response.data;
  }
);

export const getTodayRentals = createAsyncThunk<TodayRentalsResponse, void>(
  "rentals/getTodayRentals",
  async () => {
    const response = await axios.get<TodayRentalsResponse>(
      "http://localhost:5000/rentals/today"
    );
    return response.data;
  }
);

export const getTodayEndingRentals = createAsyncThunk<Rental[], void>(
  "rentals/getTodayEndingRentals",
  async () => {
    const response = await axios.get<Rental[]>(
      "http://localhost:5000/rentals/ends-today"
    );
    return response.data;
  }
);

export const getRentalsByDate = createAsyncThunk<Rental[], string>(
  "rentals/byDate",
  async (date) => {
    const response = await axios.get(
      `http://localhost:5000/rentals?date=${date}`
    );
    console.log(response.data, "response.data in thunk 2121");
    return response.data;
  }
);

export const getCleaningRentalsByDate = createAsyncThunk<Rental[], string>(
  "rentals/cleaning",
  async (date) => {
    const response = await axios.get(
      `http://localhost:5000/rentals/cleaning?date=${date}`
    );
    console.log(response.data, "response.data in slice cleaning 1111");
    return response.data;
  }
);

export const getEndingRentalsByDate = createAsyncThunk<Rental[], string>(
  "rentals/ending",
  async (date) => {
    const response = await axios.get(
      `http://localhost:5000/rentals/ends?date=${date}`
    );
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
    builder.addCase(getTodayRentals.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getTodayRentals.fulfilled,
      (state, action: PayloadAction<TodayRentalsResponse>) => {
        state.rentals = action.payload.rentals;
        state.totalDeposit = action.payload.totalDeposit;
        state.loading = false;
      }
    );
    builder.addCase(getTodayRentals.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(getTodayEndingRentals.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getTodayEndingRentals.fulfilled,
      (state, action: PayloadAction<Rental[]>) => {
        state.todayEndingRentals = action.payload;
        console.log(action.payload, "action.payload in slice");
        state.loading = false;
      }
    );
    builder.addCase(getTodayEndingRentals.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(
      getRentalsByDate.fulfilled,
      (state, action: PayloadAction<Rental[]>) => {
        state.rentalsByDate = action.payload;
        console.log(action.payload, "BY DATE in slice rentalsByDate 5555");
      }
    );
    builder.addCase(
      getCleaningRentalsByDate.fulfilled,
      (state, action: PayloadAction<Rental[]>) => {
        state.cleaningsRentalsByDate = action.payload;
        console.log(action.payload, "CLEANING RENTALS in slice 66666");
      }
    );
    builder.addCase(
      getEndingRentalsByDate.fulfilled,
      (state, action: PayloadAction<Rental[]>) => {
        state.endingRentalsByDate = action.payload;
        console.log(action.payload, "ENDING RENTALS in slice 77777");
      }
    );
  },
});

export default rentalsSlice.reducer;
