// Realistic Mock Data for Load Africa Logistics Platform (South Africa)

const DEFAULT_USERS = [
  { id: 'usr-1', name: 'Patrice Motsepe', email: 'patrice@arm.co.za', phone: '+27 82 111 2222', company: 'African Rainbow Minerals', role: 'customer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', status: 'active', joinedDate: '2025-01-15' },
  { id: 'usr-2', name: 'Wendy Appelbaum', email: 'wendy@demorgenzon.co.za', phone: '+27 83 333 4444', company: 'De Morgenzon Estate', role: 'customer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', status: 'active', joinedDate: '2025-02-10' },
  { id: 'usr-3', name: 'Stephen Saad', email: 'stephen@aspenpharma.co.za', phone: '+27 84 555 6666', company: 'Aspen Pharmacare', role: 'customer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', status: 'active', joinedDate: '2025-03-01' }
];

const DEFAULT_DRIVERS = [
  { id: 'drv-1', name: 'Sipho Zuma', email: 'sipho.zuma@load-driver.co.za', phone: '+27 72 455 6677', rating: 4.8, trips: 142, earnings: 45000, walletBalance: 8500, status: 'active', kycStatus: 'verified', vehicleId: 'vh-1', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', joinedDate: '2025-01-20' },
  { id: 'drv-2', name: 'Jabulani Khumalo', email: 'jabulani.k@load-driver.co.za', phone: '+27 73 345 6789', rating: 4.9, trips: 89, earnings: 32000, walletBalance: 4200, status: 'active', kycStatus: 'verified', vehicleId: 'vh-2', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', joinedDate: '2025-02-18' },
  { id: 'drv-3', name: 'Pieter Botha', email: 'pieter.b@load-driver.co.za', phone: '+27 82 123 4567', rating: 4.5, trips: 15, earnings: 6800, walletBalance: 1200, status: 'pending_verification', kycStatus: 'pending', vehicleId: 'vh-3', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80', joinedDate: '2026-06-10' },
  { id: 'drv-4', name: 'Kagiso Ledwaba', email: 'kagiso.l@load-driver.co.za', phone: '+27 76 234 5678', rating: 0.0, trips: 0, earnings: 0, walletBalance: 0, status: 'new', kycStatus: 'submitted', vehicleId: null, avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80', joinedDate: '2026-06-23' }
];

const DEFAULT_BROKERS = [
  { id: 'brk-1', name: 'Lwazi Dlamini', email: 'lwazi.dlamini@loadafrica-broker.co.za', phone: '+27 82 987 6543', rating: 4.7, commissionRate: 5, assignedLoadsCount: 18, commissionEarned: 18200, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80', status: 'active', joinedDate: '2025-01-18' },
  { id: 'brk-2', name: 'Zanele Khumalo', email: 'zanele.k@loadafrica-broker.co.za', phone: '+27 83 555 1234', rating: 4.9, commissionRate: 5, assignedLoadsCount: 8, commissionEarned: 9500, avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', status: 'active', joinedDate: '2025-03-05' }
];

const DEFAULT_VEHICLES = [
  { id: 'vh-1', numberPlate: 'GP 82 DF GP', model: 'Volvo FH16 Flatbed', type: 'Flatbed Truck', capacity: '25 Tons', driverName: 'Sipho Zuma', status: 'active', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop&q=80' },
  { id: 'vh-2', numberPlate: 'CA 291-802', model: 'Scania R500 Tipper', type: 'Tipper Truck', capacity: '30 Tons', driverName: 'Jabulani Khumalo', status: 'active', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80' },
  { id: 'vh-3', numberPlate: 'L 482 NW', model: 'Mercedes-Benz Actros Box', type: 'Box Truck', capacity: '15 Tons', driverName: 'Pieter Botha', status: 'inactive', image: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=300&auto=format&fit=crop&q=80' }
];

const DEFAULT_LOADS = [
  { id: 'ld-101', title: '500 Bags of Cement', weight: '25 Tons', category: 'Building Materials', pickup: 'PPC Cement Jupiter, Germiston, Johannesburg, South Africa', dropoff: 'Shoprite Distribution Centre, Centurion, Pretoria, South Africa', distance: '64 km', budget: 12000, date: '2026-06-25', status: 'assigned', customerName: 'Patrice Motsepe', customerId: 'usr-1', driverId: 'drv-1', brokerId: 'brk-1' },
  { id: 'ld-102', title: 'Industrial Machinery Spares', weight: '12 Tons', category: 'Heavy Equipment', pickup: 'Durban Port, Durban, South Africa', dropoff: 'Rosslyn Industrial Area, Pretoria, South Africa', distance: '620 km', budget: 38000, date: '2026-06-26', status: 'available', customerName: 'Wendy Appelbaum', customerId: 'usr-2', driverId: null, brokerId: null },
  { id: 'ld-103', title: 'Refined Sugar Cargo', weight: '28 Tons', category: 'Food & Beverage', pickup: 'Huletts Sugar Refinery, Durban, South Africa', dropoff: 'Mitchells Plain, Cape Town, South Africa', distance: '1600 km', budget: 49000, date: '2026-06-24', status: 'in_transit', customerName: 'Patrice Motsepe', customerId: 'usr-1', driverId: 'drv-2', brokerId: 'brk-1' },
  { id: 'ld-104', title: 'Cotton Bales consignment', weight: '18 Tons', category: 'Agriculture', pickup: 'Agricultural Farms, Rustenburg, South Africa', dropoff: 'Coega Port, Port Elizabeth, South Africa', distance: '1050 km', budget: 15000, date: '2026-06-22', status: 'completed', customerName: 'Stephen Saad', customerId: 'usr-3', driverId: 'drv-1', brokerId: 'brk-2' },
  { id: 'ld-105', title: 'FMCG Goods Packaged', weight: '8 Tons', category: 'Consumer Goods', pickup: 'Unilever Warehouse, Durban, South Africa', dropoff: 'Retail Hub, Johannesburg, South Africa', distance: '570 km', budget: 9800, date: '2026-06-27', status: 'available', customerName: 'Stephen Saad', customerId: 'usr-3', driverId: null, brokerId: null }
];

const DEFAULT_BOOKINGS = [
  { id: 'bk-1001', loadId: 'ld-101', customerId: 'usr-1', driverId: 'drv-1', vehicleId: 'vh-1', price: 12000, paymentStatus: 'paid', bookingStatus: 'assigned', date: '2026-06-24', tracking: { currentLat: -26.1201, currentLng: 28.0401, status: 'Driver Assigned - Near Germiston', lastUpdate: '10 mins ago' } },
  { id: 'bk-1002', loadId: 'ld-103', customerId: 'usr-1', driverId: 'drv-2', vehicleId: 'vh-2', price: 49000, paymentStatus: 'paid', bookingStatus: 'in_transit', date: '2026-06-23', tracking: { currentLat: -29.8587, currentLng: 31.0218, status: 'In Transit - Approaching Bloemfontein', lastUpdate: 'Just now' } },
  { id: 'bk-1003', loadId: 'ld-104', customerId: 'usr-3', driverId: 'drv-1', vehicleId: 'vh-1', price: 15000, paymentStatus: 'paid', bookingStatus: 'completed', date: '2026-06-22' }
];


const DEFAULT_EQUIPMENT = [
  { id: 'EQ-001', name: 'TLB (Backhoe Loader)', make: 'JCB 3CX', rate: 850, status: 'on_hire', site: 'Rustenburg Mine Site', operatorId: 'op-1', image: 'https://images.unsplash.com/photo-1579970894563-305aa31fa6d2?w=300&auto=format&fit=crop' },
  { id: 'EQ-002', name: 'Excavator (20T)', make: 'CAT 320', rate: 1200, status: 'available', site: '—', operatorId: null, image: 'https://images.unsplash.com/photo-1581451076939-5a9e33d2629b?w=300&auto=format&fit=crop' },
  { id: 'EQ-003', name: 'Grader (Motor)', make: 'Komatsu GD655', rate: 1400, status: 'on_hire', site: 'Joburg Road Works', operatorId: 'op-2', image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop' },
  { id: 'EQ-004', name: 'Compactor (Roller)', make: 'Bomag BW 213', rate: 600, status: 'maintenance', site: '—', operatorId: null, image: 'https://images.unsplash.com/photo-1575828292850-d4766bc943a4?w=300&auto=format&fit=crop' }
];

const DEFAULT_OPERATORS = [
  { id: 'op-1', name: 'Thabo Mokoena', phone: '+27 71 222 3333', status: 'active', equipmentId: 'EQ-001', rating: 4.8 },
  { id: 'op-2', name: 'John van der Merwe', phone: '+27 82 444 5555', status: 'active', equipmentId: 'EQ-003', rating: 4.9 },
  { id: 'op-3', name: 'Sibusiso Nxumalo', phone: '+27 83 666 7777', status: 'available', equipmentId: null, rating: 4.5 }
];

const DEFAULT_HIRE_REQUESTS = [
  { id: 'HR-2024-018', client: 'BuildRight Construction', machine: 'TLB (Backhoe Loader)', site: 'Pretoria, Gauteng', startDate: '2026-07-08', duration: '5 days', totalValue: 34000, status: 'pending' },
  { id: 'HR-2024-019', client: 'City Roads Ltd', machine: 'Grader (Motor)', site: 'Johannesburg, Gauteng', startDate: '2026-07-10', duration: '3 days', totalValue: 29400, status: 'pending' }
];

const DEFAULT_MAINTENANCE = [
  { id: 'mt-1', equipmentId: 'EQ-004', issue: 'Hydraulic leak repair', date: '2026-07-05', cost: 4500, status: 'in_progress' },
  { id: 'mt-2', equipmentId: 'EQ-001', issue: 'Regular 500hr service', date: '2026-06-20', cost: 2100, status: 'completed' }
];

const DEFAULT_PAYMENTS = [
  { id: 'tx-2001', bookingId: 'bk-1001', amount: 12000, status: 'completed', method: 'EFT Bank Transfer', date: '2026-06-24', customerName: 'Patrice Motsepe', driverName: 'Sipho Zuma' },
  { id: 'tx-2002', bookingId: 'bk-1002', amount: 49000, status: 'completed', method: 'Card (Visa)', date: '2026-06-23', customerName: 'Patrice Motsepe', driverName: 'Jabulani Khumalo' },
  { id: 'tx-2003', bookingId: 'bk-1003', amount: 15000, status: 'completed', method: 'EFT Bank Transfer', date: '2026-06-22', customerName: 'Stephen Saad', driverName: 'Sipho Zuma' },
  { id: 'tx-2004', bookingId: 'bk-1001', amount: 800, status: 'pending', method: 'Cash', date: '2026-06-24', customerName: 'Patrice Motsepe', driverName: 'Sipho Zuma' }
];

const DEFAULT_NOTIFICATIONS = {
  customer: [
    { id: 'nt-c1', title: 'Load Assigned', message: 'Your load "500 Bags of Cement" has been assigned to driver Sipho Zuma.', read: false, time: '10 mins ago', type: 'info' },
    { id: 'nt-c2', title: 'Trip Completed', message: 'Your booking for "Cotton Bales consignment" was completed successfully.', read: true, time: '1 day ago', type: 'success' }
  ],
  driver: [
    { id: 'nt-d1', title: 'New Available Load', message: 'A flatbed load of "Industrial Machinery Spares" (12 Tons) is available nearby.', read: false, time: '2 mins ago', type: 'alert' },
    { id: 'nt-d2', title: 'KYC Verified', message: 'Congratulations! Your KYC document validation was successful.', read: false, time: '2 hours ago', type: 'success' }
  ],
  broker: [
    { id: 'nt-b1', title: 'New Lead Broadcasted', message: 'Customer Wendy posted a new machinery spares lead.', read: false, time: '1 min ago', type: 'info' },
    { id: 'nt-b2', title: 'Commission Credited', message: 'You earned R750.00 commission for load ld-104 delivery completion.', read: false, time: '1 hour ago', type: 'success' }
  ],
  admin: [
    { id: 'nt-a1', title: 'New Driver Registration', message: 'Kagiso Ledwaba registered and submitted KYC documents for review.', read: false, time: '5 mins ago', type: 'pending' },
    { id: 'nt-a2', title: 'High Value Booking', message: 'New booking bk-1002 created for Sugar refinery cargo of R49,000.', read: true, time: '3 hours ago', type: 'info' }
  ]
};

// Initial state helpers
const getStored = (key, fallback) => {
  const item = localStorage.getItem(`loadafrica_${key}`);
  return item ? JSON.parse(item) : fallback;
};

const setStored = (key, val) => {
  localStorage.setItem(`loadafrica_${key}`, JSON.stringify(val));
};

export const initializeMockData = () => {
  if (!localStorage.getItem('loadafrica_initialized_sa')) {
    setStored('users', DEFAULT_USERS);
    setStored('drivers', DEFAULT_DRIVERS);
    setStored('brokers', DEFAULT_BROKERS);
    setStored('vehicles', DEFAULT_VEHICLES);
    setStored('loads', DEFAULT_LOADS);
    setStored('bookings', DEFAULT_BOOKINGS);
    setStored('payments', DEFAULT_PAYMENTS);
    setStored('equipment', DEFAULT_EQUIPMENT);
    setStored('operators', DEFAULT_OPERATORS);
    setStored('hireRequests', DEFAULT_HIRE_REQUESTS);
    setStored('maintenance', DEFAULT_MAINTENANCE);
    setStored('notifications', DEFAULT_NOTIFICATIONS);
    localStorage.setItem('loadafrica_initialized_sa', 'true');
  }
};

export const getMockData = (key) => {
  initializeMockData();
  switch (key) {
    case 'users': return getStored('users', DEFAULT_USERS);
    case 'drivers': return getStored('drivers', DEFAULT_DRIVERS);
    case 'brokers': return getStored('brokers', DEFAULT_BROKERS);
    case 'vehicles': return getStored('vehicles', DEFAULT_VEHICLES);
    case 'loads': return getStored('loads', DEFAULT_LOADS);
    case 'bookings': return getStored('bookings', DEFAULT_BOOKINGS);
    case 'payments': return getStored('payments', DEFAULT_PAYMENTS);
    case 'equipment': return getStored('equipment', DEFAULT_EQUIPMENT);
    case 'operators': return getStored('operators', DEFAULT_OPERATORS);
    case 'hireRequests': return getStored('hireRequests', DEFAULT_HIRE_REQUESTS);
    case 'maintenance': return getStored('maintenance', DEFAULT_MAINTENANCE);
    case 'notifications': return getStored('notifications', DEFAULT_NOTIFICATIONS);
    default: return null;
  }
};

export const saveMockData = (key, data) => {
  setStored(key, data);
};

export const createLoad = (loadData) => {
  const loads = getMockData('loads');
  const newLoad = {
    id: `ld-${Math.floor(100 + Math.random() * 900)}`,
    status: 'available',
    date: new Date().toISOString().split('T')[0],
    driverId: null,
    brokerId: null,
    ...loadData
  };
  loads.unshift(newLoad);
  saveMockData('loads', loads);
  
  // Push notifications
  const notifications = getMockData('notifications');
  notifications.driver.unshift({
    id: `nt-d-${Math.random()}`,
    title: 'New Available Load',
    message: `New load "${loadData.title}" (${loadData.weight}) is available. Budget: R${loadData.budget}.`,
    read: false,
    time: 'Just now',
    type: 'alert'
  });
  notifications.broker.unshift({
    id: `nt-b-${Math.random()}`,
    title: 'New Lead Broadcasted',
    message: `Customer ${loadData.customerName} posted new lead details: "${loadData.title}".`,
    read: false,
    time: 'Just now',
    type: 'info'
  });
  notifications.admin.unshift({
    id: `nt-a-${Math.random()}`,
    title: 'New Load Created',
    message: `Customer ${loadData.customerName} created load "${loadData.title}"`,
    read: false,
    time: 'Just now',
    type: 'info'
  });
  saveMockData('notifications', notifications);
  return newLoad;
};

export const acceptLoad = (loadId, driverId, vehicleId) => {
  const loads = getMockData('loads');
  const drivers = getMockData('drivers');
  const bookings = getMockData('bookings');
  
  const loadIndex = loads.findIndex(l => l.id === loadId);
  const driver = drivers.find(d => d.id === driverId);
  
  if (loadIndex > -1 && driver) {
    loads[loadIndex].status = 'assigned';
    loads[loadIndex].driverId = driverId;
    saveMockData('loads', loads);
    
    const newBookingId = `bk-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking = {
      id: newBookingId,
      loadId: loadId,
      customerId: loads[loadIndex].customerId,
      driverId: driverId,
      vehicleId: vehicleId || driver.vehicleId || 'vh-1',
      price: loads[loadIndex].budget,
      paymentStatus: 'paid',
      bookingStatus: 'assigned',
      date: new Date().toISOString().split('T')[0],
      tracking: {
        currentLat: -26.2041,
        currentLng: 28.0473,
        status: 'Driver Assigned',
        lastUpdate: 'Just now'
      }
    };
    
    bookings.unshift(newBooking);
    saveMockData('focused_bookings', bookings); // Wait, make sure we use bookings
    saveMockData('bookings', bookings);
    
    // Add customer notification
    const notifications = getMockData('notifications');
    notifications.customer.unshift({
      id: `nt-c-${Math.random()}`,
      title: 'Driver Assigned',
      message: `Driver ${driver.name} has accepted your load "${loads[loadIndex].title}"`,
      read: false,
      time: 'Just now',
      type: 'success'
    });
    saveMockData('notifications', notifications);
    return newBooking;
  }
  return null;
};
