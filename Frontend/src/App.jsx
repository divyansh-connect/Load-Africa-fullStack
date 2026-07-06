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

// Customer Auth + Dashboard
import CustomerAuth from './pages/customer/CustomerAuth';
import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CreateBooking from './pages/customer/CreateBooking';
import ActiveDeliveries from './pages/customer/ActiveDeliveries';
import Tracking from './pages/customer/Tracking';
import BookingHistory from './pages/customer/BookingHistory';
import CustomerProfile from './pages/customer/CustomerProfile';

// Driver Auth + Dashboard
import DriverAuth from './pages/driver/DriverAuth';
import DriverLayout from './layouts/DriverLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import ActiveTrip from './pages/driver/ActiveTrip';
import EarningsWallet from './pages/driver/EarningsWallet';
import VehicleManagement from './pages/driver/VehicleManagement';
import KYCVerification from './pages/driver/KYCVerification';
import DriverProfile from './pages/driver/DriverProfile';

// Broker Auth + Dashboard
import BrokerAuth from './pages/broker/BrokerAuth';
import BrokerLayout from './layouts/BrokerLayout';
import BrokerDashboard from './pages/broker/BrokerDashboard';
import Leads from './pages/broker/Leads';
import AssignedLoads from './pages/broker/AssignedLoads';
import CustomersList from './pages/broker/CustomersList';
import Reports from './pages/broker/Reports';

// Admin Auth + Dashboard
import AdminAuth from './pages/admin/AdminAuth';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageBookings from './pages/admin/ManageBookings';
import PaymentsReports from './pages/admin/PaymentsReports';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        
        {/* Public Website */}
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
        <Route path="/broker/login" element={<BrokerAuth />} />
        <Route path="/admin/login" element={<AdminAuth />} />
        <Route path="/signup" element={<Signup />} />

        {/* ─── Customer Auth ─── */}
        <Route path="/customer/login" element={<CustomerAuth />} />

        {/* ─── Customer Portal (Protected Layout) ─── */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="create-booking" element={<CreateBooking />} />
          <Route path="active-deliveries" element={<ActiveDeliveries />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="booking-history" element={<BookingHistory />} />
          <Route path="profile" element={<CustomerProfile />} />
          {/* Default redirect for /customer → dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ─── Driver Auth ─── */}
        <Route path="/driver/login" element={<DriverAuth />} />

        {/* ─── Driver Portal (Protected Layout) ─── */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="available-loads" element={<DriverDashboard view="loads" />} />
          <Route path="active-trip" element={<ActiveTrip />} />
          <Route path="earnings" element={<EarningsWallet />} />
          <Route path="vehicle-management" element={<VehicleManagement />} />
          <Route path="kyc" element={<KYCVerification />} />
          <Route path="profile" element={<DriverProfile />} />
          {/* Default redirect for /driver → dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ─── Broker Auth ─── */}
        {/* /broker/login already handled above */}

        {/* ─── Broker Portal (Protected Layout) ─── */}
        <Route path="/broker" element={<BrokerLayout />}>
          <Route path="dashboard" element={<BrokerDashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="assigned-loads" element={<AssignedLoads />} />
          <Route path="customers" element={<CustomersList />} />
          <Route path="reports" element={<Reports />} />
          {/* Default redirect for /broker → dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ─── Admin Auth ─── */}
        {/* /admin/login already handled above */}

        {/* ─── Admin Portal (Protected Layout) ─── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="payments" element={<PaymentsReports />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* Default redirect for /admin → dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Catch-all global redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
