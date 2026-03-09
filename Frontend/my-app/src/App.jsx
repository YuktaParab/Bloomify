import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "./context/ThemeContext";

import Login from "./components/Login";
import Signup from "./components/Signup";
import ForgotPassword from "./components/ForgotPassword";
import ChangePassword from "./components/ChangePassword";
import Home from "./components/Home";
import SpacePhotoAnalysis from "./components/SpacePhotoAnalysis";
import PlantDetails from "./components/PlantDetails";
import MyPlants from "./components/MyPlants";
import CareGuide from "./components/CareGuide";
import StarterPlantKits from "./components/StarterPlantKits";

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
    <Routes location={location} key={location.pathname}>
      {/* Default Route */}
      <Route path="/" element={<Home />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Home Page */}
      <Route path="/home" element={<Home />} />

      {/* Space Analysis */}
      <Route path="/space-analysis" element={<SpacePhotoAnalysis />} />

      {/* Plant Catalog */}
      <Route path="/plant-catalog" element={<PlantDetails />} />

      {/* My Plants Dashboard */}
      <Route path="/my-plants" element={<MyPlants />} />

      {/* Care Guide */}
      <Route path="/care-guide" element={<CareGuide />} />

      {/* Starter Plant Kits */}
      <Route path="/starter-kits" element={<StarterPlantKits />} />

      {/* Redirect Unknown Routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  );
}
