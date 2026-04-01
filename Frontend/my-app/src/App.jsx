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
import PlantCatalogPage from "./components/PlantCatalogPage";
import MyPlants from "./components/MyPlants";
import CareGuide from "./components/CareGuide";
import GrowthGuide from "./components/GrowthGuide";
import StarterPlantKits from "./components/StarterPlantKits";
import UserProfile from "./components/UserProfile";
import UserActivity from "./components/UserActivity";
import PricingPlans from "./components/PricingPlans";
import ProductsShop from "./components/ProductsShop";
import ShoppingCart from "./components/ShoppingCart";
import Checkout from "./components/Checkout";
import OrderHistory from "./components/OrderHistory";
import SellerDashboard from "./components/SellerDashboard";
import CreateListing from "./components/CreateListing";

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

      {/* User Profile & Activity */}
      <Route path="/my-profile" element={<UserProfile />} />
      <Route path="/my-activity" element={<UserActivity />} />

      {/* Space Analysis */}
      <Route path="/space-analysis" element={<SpacePhotoAnalysis />} />

      {/* Pricing & Subscription */}
      <Route path="/pricing" element={<PricingPlans />} />

      {/* Plant Catalog */}
      <Route path="/plant-catalog" element={<PlantDetails />} />

      {/* Plant Growing Guide Page with Catalog and Voice */}
      <Route path="/plant-guide" element={<PlantCatalogPage />} />

      {/* My Plants Dashboard */}
      <Route path="/my-plants" element={<MyPlants />} />

      {/* Care Guide */}
      <Route path="/care-guide" element={<CareGuide />} />

      {/* Growth Guide - Plant Growing Steps with Voice */}
      <Route path="/growth-guide/:plantName" element={<GrowthGuide />} />

      {/* Starter Plant Kits */}
      <Route path="/starter-kits" element={<StarterPlantKits />} />

      {/* E-Commerce Routes */}
      <Route path="/products-shop" element={<ProductsShop />} />
      <Route path="/shopping-cart" element={<ShoppingCart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-history" element={<OrderHistory />} />
      <Route path="/seller-dashboard" element={<SellerDashboard />} />
      <Route path="/create-listing" element={<CreateListing />} />

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
