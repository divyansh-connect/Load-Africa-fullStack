import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Home Landing Page
import Home from './pages/Home';
import Contact from './pages/Contact';
import Customers from './pages/Customers';
import Register from './pages/Register';
import Drivers from './pages/Drivers';
import Fleet from './pages/Fleet';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ListFleet from './pages/ListFleet';
import ListPlant from './pages/ListPlant';
import YellowPlantBooking from './pages/YellowPlantBooking';
import DriverRegister from './pages/DriverRegister';
import CustomerRegister from './pages/CustomerRegister';
import TermsConditions from './pages/TermsConditions';

// ── Customer Auth + Dashboard ──
import CustomerAuth from './pages/customer/CustomerAuth';
import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateBooking from './pages/customer/CreateBooking';
import ActiveDeliveries from './pages/customer/ActiveDeliveries';
import Tracking from './pages/customer/Tracking';
import BookingHistory from './pages/customer/BookingHistory';
import CustomerProfile from './pages/customer/CustomerProfile';

// ── Driver Auth + Dashboard ──
import DriverAuth from './pages/driver/DriverAuth';
import DriverLayout from './layouts/DriverLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveTrip from './pages/driver/ActiveTrip';
import EarningsWallet from './pages/driver/EarningsWallet';
import VehicleManagement from './pages/driver/VehicleManagement';
import KYCVerification from './pages/driver/KYCVerification';
import DriverProfile from './pages/driver/DriverProfile';

// ── Fleet Auth + Dashboard ──
import FleetAuth from './pages/fleet/FleetAuth';
import FleetLayout from './layouts/FleetLayout';
import FleetDashboard from './pages/fleet/FleetDashboard';

// ── Yellow Plant Auth + Dashboard ──
import PlantAuth from './pages/plant/PlantAuth';
import PlantLayout from './layouts/PlantLayout';
import PlantDashboard from './pages/plant/PlantDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Website ── */}
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/register" element={<Register />} />
        <Route path="/customer/register" element={<CustomerRegister />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route path="/fleet" element={<Fleet />} />
        <Route path="/fleet/register" element={<ListFleet />} />
        <Route path="/plant/register" element={<ListPlant />} />
        <Route path="/yellow-plant" element={<YellowPlantBooking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/terms-conditions" element={<TermsConditions />} />

        {/* ── Customer Auth ── */}
        <Route path="/customer/login" element={<CustomerAuth />} />

        {/* ── Customer Portal (Protected Layout) ── */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="create-booking" element={<CreateBooking />} />
          <Route path="active-deliveries" element={<ActiveDeliveries />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="booking-history" element={<BookingHistory />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Driver Auth ── */}
        <Route path="/driver/login" element={<DriverAuth />} />

        {/* ── Driver Portal (Protected Layout) ── */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="available-loads" element={<DriverDashboard />} />
          <Route path="active-trip" element={<ActiveTrip />} />
          <Route path="earnings" element={<EarningsWallet />} />
          <Route path="vehicle-management" element={<VehicleManagement />} />
          <Route path="kyc" element={<KYCVerification />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Fleet Auth ── */}
        <Route path="/fleet/login" element={<FleetAuth />} />

        {/* ── Fleet Portal (Protected Layout) — /fleet-portal/* ── */}
        <Route path="/fleet-portal" element={<FleetLayout />}>
          <Route path="dashboard" element={<FleetDashboard />} />
          <Route path="vehicles" element={<FleetDashboard />} />
          <Route path="requests" element={<FleetDashboard />} />
          <Route path="revenue" element={<FleetDashboard />} />
          <Route path="add-vehicle" element={<FleetDashboard />} />
          <Route path="profile" element={<FleetDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Yellow Plant Auth ── */}
        <Route path="/plant/login" element={<PlantAuth />} />

        {/* ── Yellow Plant Portal (Protected Layout) — /plant-portal/* ── */}
        <Route path="/plant-portal" element={<PlantLayout />}>
          <Route path="dashboard" element={<PlantDashboard />} />
          <Route path="equipment" element={<PlantDashboard />} />
          <Route path="requests" element={<PlantDashboard />} />
          <Route path="revenue" element={<PlantDashboard />} />
          <Route path="add-machine" element={<PlantDashboard />} />
          <Route path="maintenance" element={<PlantDashboard />} />
          <Route path="profile" element={<PlantDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
