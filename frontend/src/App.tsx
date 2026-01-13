import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Booking from "./pages/Booking/Booking";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import NavBar from "./components/NavBar/NavBar";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import CalendarView from "./pages/CalendarView/CalendarView";
import TodayRentals from "./pages/TodayRentals/TodayRentals";
import ReturnRentals from "./pages/ReturnRentals/ReturnRentals";
import ClothesPage from "./pages/ClothesPage/ClothesPage";
import CleaningPage from "./pages/CleaningPage/CleaningPage";

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />

      <div style={{ padding: " 5rem  2rem" }}>
        <ToastContainer
          aria-label={"toast"}
          position="top-right"
          autoClose={3000}
        />
        <Routes>
          <Route path="/" element={<Booking />} />
          <Route path="/clothes" element={<ClothesPage />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/cleaning" element={<CleaningPage />} />
          <Route path="/todays-rentals" element={<TodayRentals />} />
          <Route path="/return-rentals" element={<ReturnRentals />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
