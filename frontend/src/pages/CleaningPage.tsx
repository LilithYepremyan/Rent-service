import type { RootState } from "@reduxjs/toolkit/query";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllRentals } from "../features/rentals/rentalsSlice";
import type { Rental } from "../features/rentals/rentalsSlice";

const CleaningPage: React.FC = () => {
  const dispatch = useDispatch();
  const rentals = useSelector((state: RootState) => state.rentals.items);
  console.log("CleaningList rentals:", rentals);

  const today = new Date().toISOString().split("T")[0];
  console.log("Today:", today);
  const todayRentals = rentals.filter(
    (r) => r.startDate.split("T")[0] === today
  );

  useEffect(() => {
    dispatch(getAllRentals());
  }, [dispatch]);

  return (
    <div>
      <h2>Вещи на химчистку</h2>
      {/* {rentals.filter((rental: Rental) => rental.status === "cleaning")
        .length === 0 ? (
        <p>Нет вещей на химчистку.</p>
      ) : ( */}
      <ul>
        {
          todayRentals.map((rental) => (
            // rental.startDate.split("T")[0] ===
            // today4
            <li key={rental.cloth.name}>{rental.cloth.name} </li>
          ))
          // .map((rental) => (
          //   <li key={rental.cloth.name}>{rental.cloth.name} </li>
          // ))
        }
      </ul>
      {/* )} */}
    </div>
  );
};

export default CleaningPage;
