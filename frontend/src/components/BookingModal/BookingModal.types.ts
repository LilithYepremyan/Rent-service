import type { Customer } from "../../components/BookingModal/BookingModal";
import type { Cloth } from "../../features/clothes/clothesSlice";

export interface Rental {
  id: number;
  clothId: number;
  rentDate: string;
  startDate: string;
  endDate: string;
  status: string;
  customer: Customer;
  cloth: Cloth;
}

export interface TodayRentalsResponse {
  rentals: Rental[];
  totalDeposit: number;
}

export interface RentalsState {
  rentals: Rental[];
  todayEndingRentals: Rental[];
  rentalsByDate: Rental[];
  cleaningsRentalsByDate: Rental[];
  endingRentalsByDate: Rental[];
  totalDeposit: number;
  loading: {
    list: boolean;
    today: boolean;
    ending: boolean;
  };
}
