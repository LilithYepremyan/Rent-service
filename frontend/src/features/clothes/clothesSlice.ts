import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";
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
    const response = await api.get<Cloth[]>("/clothes");
    return response.data;
  }
);

export const deleteCloth = createAsyncThunk(
  "clothes/deleteCloth",
  async (clothId: number) => {
    await api.delete(`/clothes/${clothId}`);
    return clothId;
  }
);
export const getClothByCode = createAsyncThunk(
  "clothes/getClothByCode",
  async (clothCode: string) => {
    const response = await api.get<Cloth>(`/clothes/${clothCode}`);

    return response.data;
  }
);

export const findFreeClothesByDate = createAsyncThunk<Cloth[], string>(
  "clothes/findFreeClothesByDate",
  async (date: string) => {
    const response = await api.get<Cloth[]>(`/clothes/free?date=${date}`);
    return response.data;
  }
);

const clothesSlice = createSlice({
  name: "clothes",
  initialState,
  reducers: {
    noResults(state) {
      state.items = [];
    },
  },
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
        state.items = [action.payload];
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
