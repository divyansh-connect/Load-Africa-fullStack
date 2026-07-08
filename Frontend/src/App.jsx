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
import BookingDetails from './pages/customer/BookingDetails';
import CustomerProfile from './pages/customer/CustomerProfile';

// ── Driver Auth + Dashboard ──
import DriverAuth from './pages/driver/DriverAuth';
import DriverLayout from './layouts/DriverLayout';
import DriverDashboard from './pages/driver/DriverDashboard';
import AvailableLoads from './pages/driver/AvailableLoads';
import ActiveTrip from './pages/driver/ActiveTrip';
import EarningsWallet from './pages/driver/EarningsWallet';
import VehicleManagement from './pages/driver/VehicleManagement';
import KYCVerification from './pages/driver/KYCVerification';
import DriverProfile from './pages/driver/DriverProfile';

// ── Fleet Auth + Dashboard ──
import FleetAuth from './pages/fleet/FleetAuth';
import FleetLayout from './layouts/FleetLayout';
import FleetDashboard from './pages/fleet/FleetDashboard';
import FleetCompliance from './pages/fleet/FleetCompliance';

// ── Yellow Plant Auth + Dashboard ──
import PlantAuth from './pages/plant/PlantAuth';
import PlantLayout from './layouts/PlantLayout';
import PlantDashboard from './pages/plant/PlantDashboard';
import PlantCompliance from './pages/plant/PlantCompliance';

// ── Admin Auth + Dashboard ──
import AdminAuth from './pages/admin/AdminAuth';
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminPayments from './pages/admin/Payments';
import AdminBookings from './pages/admin/Bookings';
import AdminBookingDetails from './pages/admin/BookingDetails';
import AdminCustomers from './pages/admin/Customers';
import AdminCustomerDetails from './pages/admin/CustomerDetails';
import AdminDrivers from './pages/admin/Drivers';
import AdminDriverDetails from './pages/admin/DriverDetails';
import AdminBrokers from './pages/admin/Brokers';
import AdminBrokerDetails from './pages/admin/BrokerDetails';
import DriversList from './pages/admin/Drivers';
import BrokersList from './pages/admin/Brokers';
import FleetList from './pages/admin/Fleet';
import AdminFleetDetails from './pages/admin/FleetDetails';
import PlantOwnersList from './pages/admin/PlantOwners';
import AdminPlantDetails from './pages/admin/PlantDetails';
import CustomersList from './pages/admin/Customers';
import BookingsList from './pages/admin/Bookings';
import ProviderMatchRadius from './pages/admin/ProviderMatchRadius';
import AdminsList from './pages/admin/Admins';
import AuditLogs from './pages/admin/AuditLogs';
import AdminSettings from './pages/admin/Settings';

// ── Broker Auth + Dashboard ──
import BrokerAuth from './pages/broker/BrokerAuth';
import BrokerLayout from './layouts/BrokerLayout';
import BrokerDashboard from './pages/broker/BrokerDashboard';
import BrokerQuoteRequests from './pages/broker/QuoteRequests';
import BrokerAssignedLoads from './pages/broker/AssignedLoads';
import BrokerCustomers from './pages/broker/CustomersList';
import BrokerCommission from './pages/broker/Commission';
import BrokerProfile from './pages/broker/Profile';

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
        <Route path="/customer/login" element={<Navigate to="/login" replace />} />

        {/* ── Customer Portal (Protected Layout) ── */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="create-booking" element={<CreateBooking />} />
          <Route path="active-deliveries" element={<ActiveDeliveries />} />
          <Route path="tracking" element={<Tracking />} />
          <Route path="booking-history" element={<BookingHistory />} />
          <Route path="booking-details/:id" element={<BookingDetails />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Driver Auth ── */}
        <Route path="/driver/login" element={<Navigate to="/login" replace />} />

        {/* ── Driver Portal (Protected Layout) ── */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route path="dashboard" element={<DriverDashboard />} />
          <Route path="available-loads" element={<AvailableLoads />} />
          <Route path="active-trip" element={<ActiveTrip />} />
          <Route path="earnings" element={<EarningsWallet />} />
          <Route path="vehicle-management" element={<VehicleManagement />} />
          <Route path="kyc" element={<KYCVerification />} />
          <Route path="profile" element={<DriverProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Fleet Auth ── */}
        <Route path="/fleet/login" element={<Navigate to="/login" replace />} />

        {/* ── Fleet Portal (Protected Layout) — /fleet-portal/* ── */}
        <Route path="/fleet-portal" element={<FleetLayout />}>
          <Route path="compliance" element={<FleetCompliance />} />
          <Route path="dashboard" element={<FleetDashboard />} />
          <Route path="vehicles" element={<FleetDashboard />} />
          <Route path="requests" element={<FleetDashboard />} />
          <Route path="revenue" element={<FleetDashboard />} />
          <Route path="add-vehicle" element={<FleetDashboard />} />
          <Route path="profile" element={<FleetDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Yellow Plant Auth ── */}
        <Route path="/plant/login" element={<Navigate to="/login" replace />} />

        {/* ── Yellow Plant Portal (Protected Layout) — /plant-portal/* ── */}
        <Route path="/plant-portal" element={<PlantLayout />}>
          <Route path="compliance" element={<PlantCompliance />} />
          <Route path="dashboard" element={<PlantDashboard />} />
          <Route path="equipment" element={<PlantDashboard />} />
          <Route path="requests" element={<PlantDashboard />} />
          <Route path="revenue" element={<PlantDashboard />} />
          <Route path="add-machine" element={<PlantDashboard />} />
          <Route path="maintenance" element={<PlantDashboard />} />
          <Route path="profile" element={<PlantDashboard />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Admin Auth ── */}
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />

        {/* ── Admin Portal (Protected Layout) — /admin-portal/* ── */}
        <Route path="/admin-portal" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin-portal/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="payments" element={<AdminPayments />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="bookings/:id" element={<AdminBookingDetails />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/:id" element={<AdminCustomerDetails />} />
          <Route path="drivers" element={<DriversList />} />
          <Route path="drivers/:id" element={<AdminDriverDetails />} />
          <Route path="brokers" element={<BrokersList />} />
          <Route path="brokers/:id" element={<AdminBrokerDetails />} />
          <Route path="fleet" element={<FleetList />} />
          <Route path="fleet/:id" element={<AdminFleetDetails />} />
          <Route path="plant-owners" element={<PlantOwnersList />} />
          <Route path="plant-owners/:id" element={<AdminPlantDetails />} />
          <Route path="provider-match-radius" element={<ProviderMatchRadius />} />
          <Route path="admins" element={<AdminsList />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* ── Broker Auth ── */}
        <Route path="/broker/login" element={<Navigate to="/login" replace />} />

        {/* ── Broker Portal (Protected Layout) ── */}
        <Route path="/broker" element={<BrokerLayout />}>
          <Route path="dashboard" element={<BrokerDashboard />} />
          <Route path="quote-requests" element={<BrokerQuoteRequests />} />
          <Route path="assigned-loads" element={<BrokerAssignedLoads />} />
          <Route path="customers" element={<BrokerCustomers />} />
          <Route path="commission" element={<BrokerCommission />} />
          <Route path="profile" element={<BrokerProfile />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
