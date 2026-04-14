import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";
import type { Rental } from "../rentals/rentalsSlice";
import type { RootState } from "../../app/store";

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
  archivedItems: Cloth[];
  loading: boolean;
  error?: string;
}

const initialState: ClothesState = {
  items: [],
  archivedItems: [],
  loading: false,
  error: undefined,
};

export const getAllClothes = createAsyncThunk(
  "clothes/getAllClothes",
  async () => {
    const response = await api.get<Cloth[]>("/clothes");
    return response.data;
  },
);

export const getArchivedClothes = createAsyncThunk(
  "clothes/getArchivedClothes",
  async () => {
    const response = await api.get<Cloth[]>("/clothes/archived");
    console.log(response.data, "archived clothes");
    return response.data;
  },
);

export const getClothByCode = createAsyncThunk(
  "clothes/getClothByCode",
  async (clothCode: string) => {
    const response = await api.get<Cloth>(`/clothes/${clothCode}`);
    return response.data;
  },
);

export const findFreeClothesByDate = createAsyncThunk(
  "clothes/findFreeClothesByDate",
  async (date: string) => {
    const response = await api.get<Cloth[]>(`/clothes/free/${date}`);
    return response.data;
  },
);

export const archiveCloth = createAsyncThunk(
  "clothes/archiveCloth",
  async (clothId: number) => {
    await api.patch(`/clothes/${clothId}/status`, {
      status: "ARCHIVED",
    });
    return clothId;
  },
);

export const unarchiveCloth = createAsyncThunk(
  "clothes/unarchiveCloth",
  async (clothId: number) => {
    await api.patch(`/clothes/${clothId}/status`, {
      status: "AVAILABLE",
    });
    return clothId;
  },
);

export const selectActiveClothes = (state: RootState) => state.clothes.items;

export const selectArchivedClothes = (state: RootState) =>
  state.clothes.archivedItems;

export const selectClothesLoading = (state: RootState) =>
  state.clothes.loading;

const clothesSlice = createSlice({
  name: "clothes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllClothes.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getAllClothes.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(getAllClothes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    builder
      .addCase(getArchivedClothes.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getArchivedClothes.fulfilled, (state, action) => {
        state.archivedItems = action.payload;
        state.loading = false;
      })
      .addCase(getArchivedClothes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    builder
      .addCase(getClothByCode.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(getClothByCode.fulfilled, (state, action) => {
        const index = state.items.findIndex((c) => c.id === action.payload.id);

        if (index !== -1) {
          state.items[index] = action.payload;
        } else {
          state.items.push(action.payload);
        }

        state.loading = false;
      })
      .addCase(getClothByCode.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    builder
      .addCase(findFreeClothesByDate.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(findFreeClothesByDate.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(findFreeClothesByDate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });

    builder.addCase(archiveCloth.fulfilled, (state, action) => {
      const cloth = state.items.find((c) => c.id === action.payload);

      if (cloth) {
        cloth.status = "ARCHIVED";
        state.archivedItems.unshift(cloth);
      }

      state.items = state.items.filter((c) => c.id !== action.payload);
    });

    builder.addCase(unarchiveCloth.fulfilled, (state, action) => {
      const cloth = state.archivedItems.find((c) => c.id === action.payload);

      if (cloth) {
        cloth.status = "AVAILABLE";
        state.items.unshift(cloth);
      }

      state.archivedItems = state.archivedItems.filter(
        (c) => c.id !== action.payload,
      );
    });
  },
});

export default clothesSlice.reducer;