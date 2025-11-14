import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Booking from "./pages/Booking";
import AdminPanel from "./pages/AdminPanel";
import CalendarView from "./pages/CalendarView";
import CleaningList from "./pages/CleaningPage";
import ClothesList from "./pages/ClothesPage";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import NavBar from "./components/NavBar/NavBar";

const App: React.FC = () => {
  return (
    <Router>
      <NavBar />
    
      <div style={{ padding: "0px 30px" }}>
        <ToastContainer aria-label={"toast"} position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/clothes" element={<ClothesList />} />
          <Route path="/" element={<Booking />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/cleaning" element={<CleaningList />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
