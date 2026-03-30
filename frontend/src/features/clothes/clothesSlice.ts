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
  error?: string;
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
  },
);

export const archiveCloth = createAsyncThunk(
  "clothes/archiveCloth",
  async (clothId: number) => {
    await api.patch(`/clothes/${clothId}/status`, { status: "ARCHIVED" });
    return clothId;
  },
);

export const getClothByCode = createAsyncThunk(
  "clothes/getClothByCode",
  async (clothCode: string) => {
    const response = await api.get<Cloth>(`/clothes/${clothCode}`);

    return response.data;
  },
);

export const findFreeClothesByDate = createAsyncThunk<Cloth[], string>(
  "clothes/findFreeClothesByDate",
  async (date: string) => {
    const response = await api.get<Cloth[]>(`/clothes/free/${date}`);
    return response.data;
  },
);

export const updateClothStatus = createAsyncThunk(
  "clothes/updateStatus",
  async ({ id, status }: { id: number; status: string }) => {
    const response = await api.patch(`/clothes/${id}/status`, { status });
    return response.data;
  },
);
const clothesSlice = createSlice({
  name: "clothes",
  initialState,
  reducers: {
    noResults(state) {
      state.items = [];
    },
    setItems(state, action: PayloadAction<Cloth[]>) {
      state.items = action.payload;
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
      },
    );
    builder.addCase(getAllClothes.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    builder.addCase(
      getClothByCode.fulfilled,
      (state, action: PayloadAction<Cloth>) => {
        state.items = [action.payload];
      },
    );
    builder.addCase(
      findFreeClothesByDate.fulfilled,
      (state, action: PayloadAction<Cloth[]>) => {
        state.items = action.payload;
      },
    );
    builder.addCase(
      archiveCloth.fulfilled,
      (state, action: PayloadAction<number>) => {
        const index = state.items.findIndex(
          (cloth) => cloth.id === action.payload,
        );
        if (index !== -1) {
          state.items[index].status = "ARCHIVED";
        }
      },
    );
    builder.addCase(
      updateClothStatus.fulfilled,
      (state, action: PayloadAction<Cloth>) => {
        const index = state.items.findIndex(
          (cloth) => cloth.id === action.payload.id,
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      },
    );
  },
});

export default clothesSlice.reducer;
