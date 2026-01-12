import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Booking from "./pages/Booking";
import CleaningList from "./pages/CleaningPage";
import ClothesList from "./pages/ClothesPage";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import NavBar from "./components/NavBar/NavBar";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import TodayRentals from "./pages/TodayRentals";
import ReturnRentals from "./pages/ReturnRentals";
import CalendarView from "./pages/CalendarView/CalendarView";

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
          <Route path="/clothes" element={<ClothesList />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/cleaning" element={<CleaningList />} />
          <Route path="/todays-rentals" element={<TodayRentals />} />
          <Route path="/return-rentals" element={<ReturnRentals />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
