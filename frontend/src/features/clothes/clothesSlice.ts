import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { Rental } from "../rentals/rentalsSlice";

export interface Photo {
  id: number;
  url: string;
}
export interface Cloth {
  id: number;
  code: string;
  name: string;
  color: string;
  price: number;
  photos: Photo[];
  status: string;
  rentals: Rental[];
}

interface ClothesState {
  items: Cloth[];
  loading: boolean;
}

const initialState: ClothesState = {
  items: [],
  loading: false,
};

export const getAllClothes = createAsyncThunk(
  "clothes/getAllClothes",
  async () => {
    const response = await axios.get<Cloth[]>("http://localhost:5000/clothes");
    return response.data;
  }
);

export const deleteCloth = createAsyncThunk(
  "clothes/deleteCloth",
  async (clothId: number) => {
    await axios.delete(`http://localhost:5000/clothes/${clothId}`);
    return clothId;
  }
);
export const getClothByCode = createAsyncThunk(
  "clothes/getClothByCode",
  async (clothCode: string) => {
    const response = await axios.get<Cloth>(
      `http://localhost:5000/clothes/${clothCode}`
    );
    return response.data;
  }
);

export const findFreeClothesByDate = createAsyncThunk<Cloth[], string>(
  "clothes/findFreeClothesByDate",
  async (date: string) => {
    const response = await axios.get<Cloth[]>(
      `http://localhost:5000/clothes/free/${date}`
    );

    console.log("free clothes :", response.data);

    return response.data;
  }
);

const clothesSlice = createSlice({
  name: "clothes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllClothes.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getAllClothes.fulfilled,
      (state, action: PayloadAction<Cloth[]>) => {
        state.items = action.payload;
        state.loading = false;
      }
    );
    builder.addCase(getAllClothes.rejected, (state) => {
      state.loading = false;
    });
    builder.addCase(
      deleteCloth.fulfilled,
      (state, action: PayloadAction<number>) => {
        state.items = state.items.filter(
          (cloth) => cloth.id !== action.payload
        );
      }
    );
    builder.addCase(
      getClothByCode.fulfilled,
      (state, action: PayloadAction<Cloth>) => {
        state.items = state.items.map((cloth) => {
          if (cloth.id === action.payload.id) {
            console.log("Cloth found by code:", action.payload);
            return action.payload;
          }
          return cloth;
        });
      }
    );
    builder.addCase(
      findFreeClothesByDate.fulfilled,
      (state, action: PayloadAction<Cloth[]>) => {
        state.items = action.payload;
      }
    );
  },
});

export default clothesSlice.reducer;
