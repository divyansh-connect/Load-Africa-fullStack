import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HardHat, DollarSign, CheckCircle2, Clock, Plus, ChevronRight, MapPin, ArrowRight,
  TrendingUp, AlertCircle, Trash2, Edit2, ShieldAlert, Calendar, User, Key, Mail, Building,
  FileText, Star, Wrench, Download, Settings, Loader2, Filter, Search, MoreVertical,
  Activity, BarChart3, ArrowUpRight, Check, X, Lock, Upload, Image as ImageIcon, Sparkles,
  MoveLeft, AlertTriangle, Layers, CalendarCheck, Truck, HelpCircle, ArrowDownRight, ShieldCheck
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';
import { Modal, Button, Input, Card, Table, StatCard } from '../../components/ui';
import { plantService } from '../../services/plantService';
import { fleetService } from '../../services/fleetService';

// Dictionary of 40+ categories exactly matching customer booking flow
const ALL_CATEGORIES = [
  { name: 'Excavator', icon: HardHat },
  { name: 'Mini Excavator', icon: HardHat },
  { name: 'Long Reach Excavator', icon: HardHat },
  { name: 'Backhoe Loader (TLB)', icon: Wrench },
  { name: 'Front End Loader', icon: Wrench },
  { name: 'Skid Steer Loader (Bobcat)', icon: Wrench },
  { name: 'Bulldozer D6', icon: Settings },
  { name: 'Bulldozer D8', icon: Settings },
  { name: 'Motor Grader', icon: Activity },
  { name: 'Roller (Smooth Drum)', icon: Activity },
  { name: 'Roller (Padfoot)', icon: Activity },
  { name: 'Plate Compactor', icon: Activity },
  { name: 'Pneumatic Roller', icon: Activity },
  { name: 'Mobile Crane 25 Ton', icon: Truck },
  { name: 'Mobile Crane 50 Ton', icon: Truck },
  { name: 'Tower Crane', icon: Truck },
  { name: 'Crawler Crane', icon: Truck },
  { name: 'Forklift 3 Ton', icon: User },
  { name: 'Forklift 5 Ton', icon: User },
  { name: 'Telehandler', icon: User },
  { name: 'Reach Stacker', icon: User },
  { name: 'Dump Truck', icon: Truck },
  { name: 'Articulated Dump Truck', icon: Truck },
  { name: 'Water Tanker', icon: Truck },
  { name: 'Fuel Bowser', icon: Truck },
  { name: 'Concrete Mixer Truck', icon: Truck },
  { name: 'Concrete Pump', icon: Activity },
  { name: 'Asphalt Paver', icon: Activity },
  { name: 'Milling Machine', icon: Wrench },
  { name: 'Drill Rig', icon: Wrench },
  { name: 'Rock Breaker (Hammer)', icon: Wrench },
  { name: 'Compressor', icon: Activity },
  { name: 'Generator', icon: Activity },
  { name: 'Lighting Tower', icon: Activity },
  { name: 'Scissor Lift', icon: User },
  { name: 'Boom Lift', icon: User },
  { name: 'Cherry Picker', icon: User },
  { name: 'Container Handler', icon: User },
  { name: 'Tractor', icon: Wrench },
  { name: 'Agricultural Loader', icon: Wrench },
  { name: 'Other', icon: HardHat }
];

const getCategoryPlaceholder = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('excavator')) return 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80';
  if (t.includes('grader')) return 'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&auto=format&fit=crop&q=80';
  if (t.includes('crane')) return 'https://images.unsplash.com/photo-1542345812-d98b5cd6cfc5?w=400&auto=format&fit=crop&q=80';
  if (t.includes('forklift') || t.includes('telehandler') || t.includes('stacker')) return 'https://images.unsplash.com/photo-1605787020600-b9ebd5df1d07?w=400&auto=format&fit=crop&q=80';
  if (t.includes('roller') || t.includes('compactor')) return 'https://images.unsplash.com/photo-1536766768598-e0b20a135305?w=400&auto=format&fit=crop&q=80';
  if (t.includes('loader') || t.includes('tlb') || t.includes('backhoe') || t.includes('bobcat')) return 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80';
  if (t.includes('truck') || t.includes('tanker')) return 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80';
  return 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400&auto=format&fit=crop&q=80';
};

export default function PlantDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Global State
  const [equipment, setEquipment] = useState([]);
  const [operators, setOperators] = useState([]);
  const [hireRequests, setHireRequests] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [payments, setPayments] = useState([]);
  const [plantStatus, setPlantStatus] = useState('REGISTERED');
  const [loading, setLoading] = useState(true);

  // Local State
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showAddMachineView, setShowAddMachineView] = useState(false);
  
  // Assignment Wizard State
  const [wizardModal, setWizardModal] = useState({ open: false, request: null });
  const [wizardStep, setWizardStep] = useState(1);
  const [assignModal, setAssignModal] = useState({ equipmentId: '', operatorId: '' });
  
  const [rejectModal, setRejectModal] = useState({ open: false, request: null });
  const [rejectReason, setRejectReason] = useState('');
  
  // Maintenance Modal State
  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({ equipmentId: '', issue: '', date: '', cost: '' });
  
  // Equipment Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Simplified registration form state
  const [addMachineForm, setAddMachineForm] = useState({
    type: 'Excavator',
    make: '',
    model: '',
    registration_number: '',
    rate: '',
    city: '',
    province: 'Gauteng',
    pickup_address: '',
    photos: [], // Array of { id, url, isPrimary }
    documentUrl: null
  });

  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [documentUploading, setDocumentUploading] = useState(false);

  // Wallet and Revenue State
  const [wallet, setWallet] = useState(null);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const [profileForm, setProfileForm] = useState({
    companyName: 'Plant Owner',
    cipcNumber: 'N/A',
    vatNumber: 'N/A',
    taxRef: 'N/A',
    repName: 'Representative',
    email: '',
    phone: '',
    address: ''
  });
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await plantService.getDashboard();
      if (res.success && res.data) {
        setPlantStatus(res.data.status);

        // Map actual machines from database
        if (res.data.machines && res.data.machines.length > 0) {
          const mappedEquipment = res.data.machines.map(m => {
            let doc = {};
            if (m.machine_documents) {
              try {
                doc = typeof m.machine_documents === 'string' ? JSON.parse(m.machine_documents) : m.machine_documents;
              } catch (e) {
                console.error("Error parsing machine_documents", e);
                doc = {};
              }
            }
            let img = '';
            if (doc.photos && Array.isArray(doc.photos) && doc.photos.length > 0) {
              const primaryPhoto = doc.photos.find(p => p.isPrimary) || doc.photos[0];
              img = primaryPhoto.url;
            } else {
              img = doc.photo || '';
            }

            if (!img) {
              img = getCategoryPlaceholder(m.type);
            } else if (!img.startsWith('http')) {
              const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '');
              img = `${base}${img.startsWith('/') ? '' : '/'}${img}`;
            }

            return {
              id: m.id,
              name: `${doc.make || ''} ${doc.model || m.type}`.trim(),
              make: doc.make || 'N/A',
              model: doc.model || 'N/A',
              year: doc.year || 'N/A',
              rate: doc.rate || 1200,
              status: m.status?.toLowerCase() || 'available',
              image: img,
              site: m.site || 'Yard Address',
              operatorId: m.operator_id || null
            };
          });
          setEquipment(mappedEquipment);
        } else {
          setEquipment(getMockData('equipment') || []);
        }

        // Map actual operators from database
        if (res.data.operators && res.data.operators.length > 0) {
          const mappedOperators = res.data.operators.map(o => ({
            id: o.id,
            name: o.name,
            status: o.status?.toLowerCase() || 'available',
            rating: o.rating || 5
          }));
          setOperators(mappedOperators);
        } else {
          setOperators(getMockData('operators') || []);
        }

        // Map actual hire requests from database
        if (res.data.hire_requests && res.data.hire_requests.length > 0) {
          const mappedRequests = res.data.hire_requests.map(h => ({
            id: h.id,
            machine: h.booking?.equipment_type || 'Machinery',
            client: h.booking?.company_name || 'Client',
            site: h.booking?.delivery_address || 'Site Address',
            duration: h.booking?.duration || '1 day',
            startDate: h.booking?.start_date ? new Date(h.booking.start_date).toLocaleDateString() : 'N/A',
            totalValue: Number(h.booking?.total_cost) || 0,
            status: h.status?.toLowerCase() || 'pending'
          }));
          setHireRequests(mappedRequests);
        } else {
          setHireRequests(getMockData('hireRequests') || []);
        }

        setMaintenance(getMockData('maintenance') || []);
        setPayments(getMockData('payments') || []);

        // Safely parse company_documents
        let parsedDocs = {};
        if (res.data.company_documents) {
          try {
            parsedDocs = typeof res.data.company_documents === 'string' ? JSON.parse(res.data.company_documents) : res.data.company_documents;
          } catch(e) {}
        }

        // Update profile form state values too!
        setProfileForm({
          companyName: res.data.company_name || '',
          cipcNumber: parsedDocs.national_id || res.data.cipc_number || 'N/A',
          vatNumber: res.data.vat_number || 'N/A',
          taxRef: res.data.tax_ref || 'N/A',
          repName: res.data.user ? `${res.data.user.first_name} ${res.data.user.last_name || ''}`.trim() : '',
          email: res.data.user?.email || '',
          phone: res.data.user?.phone || '',
          address: parsedDocs.base_location || ''
        });

        try {
          const wRes = await plantService.getWallet();
          if (wRes.success) {
            setWallet(wRes.data);
          }
        } catch (walletErr) {
          console.error("Failed to load plant owner wallet", walletErr);
        }

      } else {
        setEquipment(getMockData('equipment') || []);
        setOperators(getMockData('operators') || []);
        setHireRequests(getMockData('hireRequests') || []);
        setMaintenance(getMockData('maintenance') || []);
        setPayments(getMockData('payments') || []);
      }
    } catch (err) {
      console.error(err);
      setEquipment(getMockData('equipment') || []);
      setOperators(getMockData('operators') || []);
      setHireRequests(getMockData('hireRequests') || []);
      setMaintenance(getMockData('maintenance') || []);
      setPayments(getMockData('payments') || []);
    } finally {
      setLoading(false);
    }
  };

  // Derived Stats
  const totalEquipment = equipment.length;
  const onHireEquipment = equipment.filter(e => e.status === 'on_hire').length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;
  const pendingRequests = hireRequests.filter(h => h.status === 'pending').length;
  
  const utilizationPercent = totalEquipment > 0 ? Math.round((onHireEquipment / totalEquipment) * 100) : 0;
  
  const monthlyRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  // --- ACTIONS ---

  const handleConfirmAssignment = () => {
    if (!assignModal.equipmentId) {
      showToast('Equipment must be selected.', 'error');
      return;
    }

    const request = wizardModal.request;

    // 1. Update Hire Requests (remove pending)
    const updatedRequests = hireRequests.filter(h => h.id !== request.id);
    saveMockData('hireRequests', updatedRequests);
    setHireRequests(updatedRequests);

    // 2. Reserve Equipment
    const updatedEquipment = equipment.map(eq => 
      eq.id === assignModal.equipmentId 
        ? { ...eq, status: 'on_hire', operatorId: assignModal.operatorId || eq.operatorId, site: request.site } 
        : eq
    );
    saveMockData('equipment', updatedEquipment);
    setEquipment(updatedEquipment);

    // 3. Assign Operator
    if (assignModal.operatorId) {
      const updatedOperators = operators.map(op => 
        op.id === assignModal.operatorId 
          ? { ...op, equipmentId: assignModal.equipmentId, status: 'on_hire' } 
          : op
      );
      saveMockData('operators', updatedOperators);
      setOperators(updatedOperators);
    }

    // 4. Generate Revenue Entry
    const newPayment = {
      id: `tx-${Math.floor(2000 + Math.random() * 8000)}`,
      bookingId: request.id,
      amount: request.totalValue,
      status: 'pending',
      method: 'EFT Bank Transfer',
      date: new Date().toISOString().split('T')[0],
      customerName: request.client,
      driverName: 'Yellow Plant ERP'
    };
    const updatedPayments = [newPayment, ...payments];
    saveMockData('payments', updatedPayments);
    setPayments(updatedPayments);

    setWizardModal({ open: false, request: null });
    setWizardStep(1);
    setAssignModal({ equipmentId: '', operatorId: '' });
    showToast('Assignment Confirmed! Equipment dispatched and tracking initiated.');
    navigate('/plant-portal/dashboard');
  };

  const handleRejectRequest = () => {
    if (!rejectReason) {
      showToast('Reason is required to reject.', 'error');
      return;
    }
    const updatedRequests = hireRequests.filter(h => h.id !== rejectModal.request.id);
    saveMockData('hireRequests', updatedRequests);
    setHireRequests(updatedRequests);

    setRejectModal({ open: false, request: null });
    setRejectReason('');
    showToast('Hire request rejected. Customer notified.', 'error');
  };

  const handleLogMaintenance = (e) => {
    e.preventDefault();
    if (!maintenanceForm.equipmentId || !maintenanceForm.issue || !maintenanceForm.date || !maintenanceForm.cost) {
      showToast('Please fill all fields', 'error');
      return;
    }

    const newMaintenance = {
      id: `mt-${Math.floor(100 + Math.random() * 900)}`,
      equipmentId: maintenanceForm.equipmentId,
      issue: maintenanceForm.issue,
      date: maintenanceForm.date,
      cost: Number(maintenanceForm.cost),
      status: 'in_progress'
    };

    const updatedMaintenance = [newMaintenance, ...maintenance];
    saveMockData('maintenance', updatedMaintenance);
    setMaintenance(updatedMaintenance);

    const updatedEquipment = equipment.map(eq => eq.id === maintenanceForm.equipmentId ? { ...eq, status: 'maintenance' } : eq);
    saveMockData('equipment', updatedEquipment);
    setEquipment(updatedEquipment);

    setMaintenanceModal(false);
    setMaintenanceForm({ equipmentId: '', issue: '', date: '', cost: '' });
    showToast('Maintenance logged successfully. Equipment marked unavailable.');
  };

  // Modern Gallery Upload handlers
  const handleUploadMachinePhoto = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (addMachineForm.photos.length + files.length > 10) {
      showToast('Maximum 10 images allowed.', 'error');
      return;
    }

    try {
      setUploadingPhoto(true);
      const uploadedPhotos = [];

      for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
          showToast(`File ${file.name} exceeds 10MB limit.`, 'error');
          continue;
        }
        if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
          showToast(`File ${file.name} format not supported.`, 'error');
          continue;
        }

        const res = await fleetService.uploadFile(file);
        if (res.success && res.data?.urls?.[0]) {
          uploadedPhotos.push({
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            url: res.data.urls[0],
            isPrimary: addMachineForm.photos.length === 0 && uploadedPhotos.length === 0
          });
        }
      }

      if (uploadedPhotos.length > 0) {
        setAddMachineForm(prev => ({
          ...prev,
          photos: [...prev.photos, ...uploadedPhotos]
        }));
        showToast('Images uploaded successfully!');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading images', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const movePhoto = (index, direction) => {
    const updatedPhotos = [...addMachineForm.photos];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < updatedPhotos.length) {
      const [movedPhoto] = updatedPhotos.splice(index, 1);
      updatedPhotos.splice(targetIndex, 0, movedPhoto);
      setAddMachineForm(prev => ({ ...prev, photos: updatedPhotos }));
    }
  };

  const deletePhoto = (id) => {
    const updatedPhotos = addMachineForm.photos.filter(p => p.id !== id);
    const deletedWasPrimary = addMachineForm.photos.find(p => p.id === id)?.isPrimary;
    if (deletedWasPrimary && updatedPhotos.length > 0) {
      updatedPhotos[0].isPrimary = true;
    }
    setAddMachineForm(prev => ({ ...prev, photos: updatedPhotos }));
    showToast('Image removed.', 'info');
  };

  const setPrimaryPhoto = (id) => {
    const updatedPhotos = addMachineForm.photos.map(p => ({
      ...p,
      isPrimary: p.id === id
    }));
    setAddMachineForm(prev => ({ ...prev, photos: updatedPhotos }));
    showToast('Primary thumbnail updated.');
  };

  const handleUploadDocument = async (file) => {
    if (!file) return;
    try {
      setDocumentUploading(true);
      const res = await fleetService.uploadFile(file);
      if (res.success && res.data?.urls?.[0]) {
        setAddMachineForm(prev => ({
          ...prev,
          documentUrl: res.data.urls[0]
        }));
        showToast('Compliance document uploaded successfully!');
      } else {
        showToast('Failed to upload document', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading document', 'error');
    } finally {
      setDocumentUploading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setWithdrawError('Please enter a valid amount.');
      return;
    }
    if (parseFloat(withdrawAmount) > (wallet?.balance || 0)) {
      setWithdrawError('Insufficient funds.');
      return;
    }

    setWithdrawing(true);
    setWithdrawError('');
    setWithdrawSuccess(false);

    try {
      const res = await plantService.withdrawEarnings(parseFloat(withdrawAmount));
      if (res.success) {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        // Re-fetch wallet details
        const wRes = await plantService.getWallet();
        if (wRes.success) {
          setWallet(wRes.data);
        }
        setTimeout(() => {
          setWithdrawModalOpen(false);
          setWithdrawSuccess(false);
        }, 2000);
      }
    } catch (err) {
      setWithdrawError(err?.response?.data?.message || 'Withdrawal request failed.');
    } finally {
      setWithdrawing(false);
    }
  };

  const isAddMachineFormValid = () => {
    if (!addMachineForm.type) return false;
    if (!addMachineForm.make) return false;
    if (!addMachineForm.model) return false;
    if (!addMachineForm.registration_number) return false;
    if (!addMachineForm.rate || Number(addMachineForm.rate) <= 0) return false;
    if (!addMachineForm.city) return false;
    if (!addMachineForm.pickup_address) return false;
    if (!addMachineForm.documentUrl) return false;
    if (addMachineForm.photos.length === 0) return false;
    return true;
  };

  const handleRegisterMachineSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAddMachineFormValid()) {
      showToast('Please fill out all required fields, upload at least one photo, and upload a compliance document.', 'error');
      return;
    }

    try {
      const payload = {
        type: addMachineForm.type,
        capacity: 0,
        registration_number: addMachineForm.registration_number,
        machine_documents: {
          photo: addMachineForm.photos.find(p => p.isPrimary)?.url || addMachineForm.photos[0]?.url || '',
          photos: addMachineForm.photos,
          make: addMachineForm.make,
          model: addMachineForm.model,
          rate: Number(addMachineForm.rate),
          city: addMachineForm.city,
          province: addMachineForm.province,
          pickup_address: addMachineForm.pickup_address,
          document: addMachineForm.documentUrl
        }
      };

      const res = await plantService.addMachine(payload);
      if (res.success) {
        showToast('New machinery successfully registered!');
        setAddMachineForm({
          type: 'Excavator',
          make: '',
          model: '',
          registration_number: '',
          rate: '',
          city: '',
          province: 'Gauteng',
          pickup_address: '',
          photos: [],
          documentUrl: null
        });
        fetchData();
        setShowAddMachineView(false);
        navigate('/plant-portal/equipment');
      } else {
        showToast(res.message || 'Failed to register machinery', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || err.message || 'Error registering machinery', 'error');
    }
  };

  // --- RENDER FUNCTIONS ---

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Command Center</h1>
        <p className="text-xs text-slate-500 font-medium">Real-time overview of heavy equipment operations.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Fleet Utilization" value={`${utilizationPercent}%`} icon={Activity} color="emerald" />
        <StatCard title="On Hire" value={onHireEquipment} icon={MapPin} color="blue" />
        <StatCard title="Under Maintenance" value={maintenanceEquipment} icon={Wrench} color="amber" />
        <StatCard title="Pending Approvals" value={pendingRequests} icon={Clock} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex justify-between items-center">
              <span>Active Rentals & Tracking</span>
              <button onClick={() => navigate('/plant-portal/equipment')} className="text-xs text-amber-600 hover:text-amber-700">View All</button>
            </h3>
            <div className="space-y-3">
              {equipment.filter(e => e.status === 'on_hire').slice(0, 5).map(eq => {
                const operator = operators.find(op => op.id === eq.operatorId);
                return (
                  <div key={eq.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-55 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <HardHat className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{eq.name}</p>
                        <p className="text-xs text-slate-500">{eq.site}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 mb-1">
                        ON HIRE
                      </span>
                      <p className="text-[10px] font-medium text-slate-500 font-bold">Op: {operator ? operator.name : 'None'}</p>
                    </div>
                  </div>
                );
              })}
              {equipment.filter(e => e.status === 'on_hire').length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm bg-slate-50 rounded-xl font-bold">No active rentals currently.</div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-500" /> Action Required
            </h3>
            <div className="space-y-3">
              {maintenance.filter(m => m.status === 'in_progress').map(m => {
                const eq = equipment.find(e => e.id === m.equipmentId);
                return (
                  <div key={m.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100/50">
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">{eq ? eq.name : 'Unknown Equipment'}</p>
                      <p className="text-[10px] text-amber-700 mt-0.5">Maintenance: {m.issue}</p>
                    </div>
                  </div>
                );
              })}
              <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-xl border border-rose-100/50">
                <FileText className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Registration Status</p>
                  <p className="text-[10px] text-rose-700 mt-0.5 font-bold">Your equipment listing is fully approved & active.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderRequests = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Hire Requests</h1>
          <p className="text-xs text-slate-500 font-medium">Process incoming rental requests and assign equipment.</p>
        </div>

        {hireRequests.length > 0 ? (
          <div className="grid gap-4">
            {hireRequests.map((req) => (
              <Card key={req.id} className="p-5">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{req.id}</span>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">PENDING</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-800 mb-3 w-full">
                      <HardHat className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>{req.machine}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400 mx-1 shrink-0" />
                      <span className="break-words max-w-full">{req.site}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-600">
                      <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Client</span>{req.client}</div>
                      <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Duration</span>{req.duration}</div>
                      <div><span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Start Date</span>{req.startDate}</div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end gap-3 min-w-0 sm:min-w-[120px] mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase">Est. Revenue</span>
                      <span className="text-xl font-black text-emerald-600">R {req.totalValue.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none font-bold" onClick={() => setRejectModal({ open: true, request: req })}>Reject</Button>
                      <Button size="sm" className="flex-1 sm:flex-none font-black" onClick={() => { setWizardModal({ open: true, request: req }); setWizardStep(1); }}>Assign Wizard</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white border border-slate-200 rounded-3xl">
            <HardHat className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-800">No Hire Requests</h3>
            <p className="text-sm text-slate-500 mt-2 font-bold">All caught up! No pending requests.</p>
          </div>
        )}

        {/* Enterprise Assignment Wizard */}
        {wizardModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Assignment Wizard</h2>
                  <p className="text-xs text-slate-500">Step {wizardStep} of 4</p>
                </div>
                <button onClick={() => setWizardModal({open: false, request: null})} className="text-slate-400 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {wizardStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><User className="h-4 w-4 text-amber-500"/> Customer Information</h3>
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Client:</span><span className="font-bold">{wizardModal.request.client}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Delivery Address:</span><span className="font-bold">{wizardModal.request.site}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Required Machine:</span><span className="font-bold">{wizardModal.request.machine}</span></div>
                      <div className="flex justify-between"><span className="text-slate-500">Rental Period:</span><span className="font-bold">{wizardModal.request.startDate} ({wizardModal.request.duration})</span></div>
                      <div className="flex justify-between pt-2 border-t border-slate-200"><span className="text-slate-500 font-bold">Estimated Revenue:</span><span className="font-black text-emerald-600">R {wizardModal.request.totalValue.toLocaleString()}</span></div>
                    </div>
                  </div>
                )}
                
                {wizardStep === 2 && (
                  <div className="space-y-4 animate-fadeIn text-left">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><HardHat className="h-4 w-4 text-amber-500"/> Select Equipment</h3>
                    <p className="text-xs text-slate-500 font-bold">Only showing equipment currently Available.</p>
                    <div className="grid gap-3">
                      {equipment.filter(e => e.status === 'available').map(eq => (
                        <div 
                          key={eq.id} 
                          onClick={() => setAssignModal({...assignModal, equipmentId: eq.id})}
                          className={`p-3 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${assignModal.equipmentId === eq.id ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-300'}`}
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{eq.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{eq.make} • R {eq.rate}/hr</p>
                          </div>
                          {assignModal.equipmentId === eq.id && <CheckCircle2 className="h-5 w-5 text-amber-600" />}
                        </div>
                      ))}
                      {equipment.filter(e => e.status === 'available').length === 0 && (
                        <div className="p-4 bg-rose-50 text-rose-700 text-sm rounded-xl font-medium border border-rose-100">
                          No available equipment matching this requirement.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-4 animate-fadeIn text-left">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><User className="h-4 w-4 text-amber-500"/> Assign Operator</h3>
                    <p className="text-xs text-slate-500">Select a certified operator (Optional).</p>
                    <div className="grid gap-3">
                      <div 
                          onClick={() => setAssignModal({...assignModal, operatorId: ''})}
                          className={`p-3 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${assignModal.operatorId === '' ? 'border-amber-500 bg-amber-50' : 'border-slate-200'}`}
                        >
                          <p className="font-bold text-slate-800 text-sm">Assign Later (No Operator)</p>
                      </div>
                      {operators.filter(o => o.status === 'available').map(op => (
                        <div 
                          key={op.id} 
                          onClick={() => setAssignModal({...assignModal, operatorId: op.id})}
                          className={`p-3 border rounded-xl cursor-pointer transition-all flex justify-between items-center ${assignModal.operatorId === op.id ? 'border-amber-500 bg-amber-50 ring-1 ring-amber-500' : 'border-slate-200 hover:border-amber-300'}`}
                        >
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{op.name}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Rating: {op.rating}★ • Certified</p>
                          </div>
                          {assignModal.operatorId === op.id && <CheckCircle2 className="h-5 w-5 text-amber-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-4 animate-fadeIn text-left">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-amber-500"/> Review Summary</h3>
                    <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Equipment</p>
                        <p className="text-sm font-bold text-slate-800">{equipment.find(e => e.id === assignModal.equipmentId)?.name || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Assigned Operator</p>
                        <p className="text-sm font-bold text-slate-800">{operators.find(o => o.id === assignModal.operatorId)?.name || 'None'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery & Client</p>
                        <p className="text-sm font-bold text-slate-800">{wizardModal.request.client} - {wizardModal.request.site}</p>
                      </div>
                      <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded border border-blue-100 font-medium">
                        Confirming will reserve the equipment, update tracking, and notify the customer instantly.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 bg-white flex justify-between items-center">
                <Button variant="ghost" onClick={() => wizardStep > 1 ? setWizardStep(wizardStep - 1) : setWizardModal({open: false, request: null})}>
                  {wizardStep === 1 ? 'Cancel' : 'Back'}
                </Button>
                
                {wizardStep < 4 ? (
                  <Button 
                    onClick={() => setWizardStep(wizardStep + 1)}
                    disabled={(wizardStep === 2 && !assignModal.equipmentId)}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold" onClick={handleConfirmAssignment}>
                    Confirm Assignment
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, request: null })} title="Reject Hire Request">
          <div className="space-y-5 text-left">
            <p className="text-sm text-slate-600">Are you sure you want to reject the hire request for <span className="font-bold text-slate-800">{rejectModal.request?.machine}</span>?</p>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Reason for Rejection *</label>
              <textarea 
                className="w-full p-3 bg-slate-55 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500" 
                rows="3" 
                placeholder="e.g. Equipment unavailable for this period..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
              ></textarea>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="outline" onClick={() => setRejectModal({ open: false, request: null })}>Cancel</Button>
              <Button className="bg-rose-600 hover:bg-rose-500 text-white" onClick={handleRejectRequest}>Confirm Reject</Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  const renderEquipment = () => {
    if (showAddMachineView) {
      return renderAddMachine();
    }

    if (selectedMachine) {
      return renderEquipmentDetails();
    }

    const filteredEq = equipment.filter(eq => {
      if (statusFilter !== 'all' && eq.status !== statusFilter) return false;
      if (searchQuery && !eq.name.toLowerCase().includes(searchQuery.toLowerCase()) && !eq.make.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Fleet Management</h1>
            <p className="text-xs text-slate-500 font-medium">Manage your heavy machinery and operators.</p>
          </div>
          <Button onClick={() => setShowAddMachineView(true)} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="h-4 w-4" /> Add Machine
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or make..." 
              className="w-full pl-10 pr-4 h-10 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="on_hire">On Hire</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <Table headers={['Machine Info', 'Rate', 'Current Status', 'Actions']}>
          {filteredEq.map((eq) => {
            return (
              <tr key={eq.id} className="hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => setSelectedMachine(eq)}>
                <td className="py-4 px-6 text-left">
                  <div className="flex items-center gap-3">
                    <img src={eq.image} alt="Machine" className="h-10 w-10 rounded-xl object-cover border border-slate-200 shrink-0" />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{eq.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-bold">{eq.make} • {eq.model}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-left">
                  <span className="text-xs font-bold text-slate-700">R {eq.rate}/hr</span>
                </td>
                <td className="py-4 px-6 text-left">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    eq.status === 'available' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                    eq.status === 'on_hire' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    eq.status === 'maintenance' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-slate-100 text-slate-650'
                  }`}>
                    {eq.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedMachine(eq); }} className="text-amber-600 font-bold">
                    Details
                  </Button>
                </td>
              </tr>
            );
          })}
        </Table>
      </div>
    );
  };

  const renderEquipmentDetails = () => {
    const eq = selectedMachine;
    const operator = operators.find(op => op.id === eq.operatorId);
    
    return (
      <div className="space-y-6 animate-scaleIn text-left">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedMachine(null)} className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:border-slate-300 transition-colors">
            <ArrowRight className="h-5 w-5 rotate-180" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">{eq.name} details</h1>
            <p className="text-xs text-slate-500 font-medium">ERP Asset Profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <Card className="p-0 overflow-hidden">
              <img src={eq.image} alt="Machine" className="w-full h-48 object-cover" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-black text-slate-800">{eq.make}</h3>
                    <p className="text-sm text-slate-500 font-semibold">{eq.name}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    eq.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                    eq.status === 'on_hire' ? 'bg-blue-100 text-blue-700' :
                    eq.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-650'
                  }`}>
                    {eq.status?.replace('_', ' ')}
                  </span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Hourly Rate</span>
                    <span className="text-sm font-semibold text-slate-800">R {eq.rate}/hr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Assigned Operator</span>
                    <span className="text-sm font-semibold text-slate-800">{operator ? operator.name : 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Model</span>
                    <span className="text-sm font-semibold text-slate-800">{eq.model || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-bold">Manufacture Year</span>
                    <span className="text-sm font-semibold text-slate-800">{eq.year || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" /> Compliance Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 hover:bg-slate-55 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-slate-850">Onboarding Documents</p>
                    <p className="text-[10px] text-emerald-600 font-black uppercase tracking-wider">Approved & Verified</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Current Status & Tracking</h3>
              {eq.status === 'on_hire' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <HardHat className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ON HIRE</span>
                        <span className="text-[10px] font-bold bg-blue-200 text-blue-700 px-2 py-0.5 rounded">Active Rental</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{eq.site}</p>
                    </div>
                  </div>
                </div>
              ) : eq.status === 'maintenance' ? (
                <div className="py-8 text-center bg-amber-50 rounded-2xl border border-amber-100 border-dashed">
                  <Wrench className="h-8 w-8 text-amber-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-amber-700">Machine is currently under maintenance.</p>
                </div>
              ) : (
                <div className="py-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100 border-dashed">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-emerald-700">Machine is currently Available in Yard.</p>
                </div>
              )}
            </Card>

            <Card>
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">Service & Repair History</h3>
              <div className="space-y-3">
                {maintenance.filter(m => m.equipmentId === eq.id).map(mt => (
                  <div key={mt.id} className="flex justify-between items-center p-3 border border-slate-100 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-slate-850">{mt.issue}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">{mt.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-800 mb-1">R {mt.cost.toLocaleString()}</p>
                      <span className={`text-[10px] font-bold uppercase ${mt.status === 'completed' ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' : 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded'}`}>{mt.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
                {maintenance.filter(m => m.equipmentId === eq.id).length === 0 && (
                  <p className="text-xs text-slate-550 text-center py-4 font-bold">No maintenance history recorded.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderAddMachine = () => {
    // Filter categories dynamically
    const filteredCategories = ALL_CATEGORIES.filter(cat => 
      cat.name.toLowerCase().includes(categorySearchQuery.toLowerCase())
    );

    // Selected category icon
    const SelectedCategoryIcon = ALL_CATEGORIES.find(c => c.name === addMachineForm.type)?.icon || HardHat;

    return (
      <div className="h-[calc(100vh-10rem)] flex flex-col overflow-hidden text-left">
        
        {/* Simple Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-b border-slate-200 shrink-0">
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> List New Machinery
            </h1>
            <p className="text-xs text-slate-500 font-bold">Register your equipment to start receiving marketplace rental bookings.</p>
          </div>
          {path.endsWith('/equipment') && (
            <Button onClick={() => setShowAddMachineView(false)} variant="outline" className="gap-2 border-slate-200">
              <MoveLeft className="h-4 w-4" /> Back to Equipment
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start flex-1 overflow-hidden h-full mt-6">
          
          {/* LEFT 4 COLUMNS: Real-Time Preview Sticky Card */}
          <div className="lg:col-span-4 space-y-6 shrink-0">
            
            {/* Caterpillar Style Real-time Preview card */}
            <Card className="p-0 overflow-hidden border border-slate-200 shadow-md">
              <div className="relative h-44 bg-slate-100">
                <img 
                  src={
                    (() => {
                      const primaryPhoto = addMachineForm.photos.find(p => p.isPrimary) || addMachineForm.photos[0];
                      if (primaryPhoto) {
                        const url = primaryPhoto.url;
                        return url.startsWith('http') ? url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${url.startsWith('/') ? '' : '/'}${url}`;
                      }
                      return getCategoryPlaceholder(addMachineForm.type);
                    })()
                  } 
                  alt="Live Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 bg-[#f99c00] text-slate-950 font-black text-[9px] px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <SelectedCategoryIcon className="h-3 w-3" />
                  {addMachineForm.type}
                </div>
                <div className="absolute bottom-3 right-3 bg-emerald-500 text-white font-black text-[9px] px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                  VERIFICATION PENDING
                </div>
              </div>
              <div className="p-4 space-y-3.5">
                <div>
                  <h3 className="text-base font-black text-slate-900 truncate">
                    {addMachineForm.make || 'Brand/Make'}
                  </h3>
                  <p className="text-xs font-bold text-slate-500">
                    {addMachineForm.model || 'Model Name'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-100 text-left">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">REGISTRATION</span>
                    <span className="text-xs font-extrabold text-slate-800 uppercase">{addMachineForm.registration_number || 'GP 12345'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">HOURLY HIRE</span>
                    <span className="text-xs font-black text-slate-900">
                      ZAR {Number(addMachineForm.rate || 0).toLocaleString()}/hr
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT 8 COLUMNS: Simplified Core Form Card */}
          <div className="lg:col-span-8 h-full overflow-y-auto pr-3 pb-6" style={{ scrollbarWidth: 'thin' }}>
            <Card className="p-6 space-y-6 text-left border border-slate-200">
              <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <HardHat className="h-4 w-4 text-amber-500" /> Equipment & Rental Details
              </h3>

              {/* 1. Category Selector */}
              <div className="space-y-2 relative">
                <label className="block text-xs font-bold text-slate-700">Select Equipment Category *</label>
                <div 
                  className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-55 flex items-center justify-between cursor-pointer hover:border-amber-500 transition-colors"
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <SelectedCategoryIcon className="h-4 w-4 text-[#f99c00]" />
                    {addMachineForm.type}
                  </span>
                  <ChevronRight className={`h-4 w-4 text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-90' : ''}`} />
                </div>
                {isCategoryDropdownOpen && (
                  <div className="absolute top-[72px] left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-2 space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search categories..."
                        className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-amber-500"
                        value={categorySearchQuery}
                        onChange={(e) => setCategorySearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-0.5" style={{ scrollbarWidth: 'none' }}>
                      {filteredCategories.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <div 
                            key={cat.name}
                            className={`p-2 hover:bg-slate-50 rounded-lg cursor-pointer flex items-center gap-2 text-xs font-bold transition-colors ${addMachineForm.type === cat.name ? 'bg-amber-50 text-[#e08b00]' : 'text-slate-700'}`}
                            onClick={() => {
                              setAddMachineForm(prev => ({ ...prev, type: cat.name }));
                              setIsCategoryDropdownOpen(false);
                            }}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {cat.name}
                          </div>
                        );
                      })}
                      {filteredCategories.length === 0 && (
                        <div className="p-3 text-center text-slate-400 text-xs">No categories match your search</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Make & Model Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Manufacturer (Make) *" 
                  placeholder="e.g. Caterpillar, Komatsu, Volvo" 
                  value={addMachineForm.make}
                  onChange={(e) => setAddMachineForm(prev => ({ ...prev, make: e.target.value }))}
                  required
                />
                <Input 
                  label="Model Number *" 
                  placeholder="e.g. 320D L, D8T" 
                  value={addMachineForm.model}
                  onChange={(e) => setAddMachineForm(prev => ({ ...prev, model: e.target.value }))}
                  required
                />
              </div>

              {/* 3. Registration & Hourly Rate Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Registration / License Plate *" 
                  placeholder="e.g. CA 123-456" 
                  value={addMachineForm.registration_number}
                  onChange={(e) => setAddMachineForm(prev => ({ ...prev, registration_number: e.target.value }))}
                  required
                />
                <Input 
                  label="Hourly Rental Rate (ZAR) *" 
                  type="number" 
                  placeholder="e.g. 1500" 
                  value={addMachineForm.rate}
                  onChange={(e) => setAddMachineForm(prev => ({ ...prev, rate: e.target.value }))}
                  required
                />
              </div>

              {/* 4. Location Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Province *</label>
                  <select
                    className="w-full h-11 px-3 border border-slate-200 rounded-xl bg-slate-55 text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    value={addMachineForm.province}
                    onChange={(e) => setAddMachineForm(prev => ({ ...prev, province: e.target.value }))}
                  >
                    <option value="Gauteng">Gauteng</option>
                    <option value="Western Cape">Western Cape</option>
                    <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                    <option value="Eastern Cape">Eastern Cape</option>
                    <option value="Free State">Free State</option>
                    <option value="Limpopo">Limpopo</option>
                    <option value="Mpumalanga">Mpumalanga</option>
                    <option value="North West">North West</option>
                    <option value="Northern Cape">Northern Cape</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Input 
                    label="City / Hub Town *" 
                    placeholder="e.g. Sandton, Cape Town" 
                    value={addMachineForm.city}
                    onChange={(e) => setAddMachineForm(prev => ({ ...prev, city: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <Input 
                label="Pickup Address *" 
                placeholder="e.g. 77 Sandton Dr, Sandton, Johannesburg" 
                value={addMachineForm.pickup_address}
                onChange={(e) => setAddMachineForm(prev => ({ ...prev, pickup_address: e.target.value }))}
                required
              />

              {/* 5. Single Upload Compliance Document */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Compliance Document (Insurance, Roadworthy, or Title) *</label>
                {addMachineForm.documentUrl ? (
                  <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-255 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-700 truncate max-w-md">{addMachineForm.documentUrl.split('/').pop()}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setAddMachineForm(prev => ({ ...prev, documentUrl: null }))}
                      className="text-xs font-bold text-red-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-between p-3 border border-slate-200 border-dashed rounded-xl cursor-pointer hover:border-amber-500 transition-colors bg-slate-50">
                    <span className="text-xs font-semibold text-slate-500">Upload PDF compliance certificate</span>
                    <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50">
                      {documentUploading ? 'Uploading...' : 'Choose File'}
                    </span>
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => handleUploadDocument(e.target.files[0])} 
                      disabled={documentUploading}
                    />
                  </label>
                )}
              </div>

              {/* 6. Photos Gallery */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">Equipment Photos (Max 3)</label>
                <div className="grid grid-cols-3 gap-3">
                  {addMachineForm.photos.map((photo, i) => (
                    <div key={photo.id} className="relative h-24 rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={photo.url.startsWith('http') ? photo.url : `${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1').replace('/api/v1', '')}${photo.url.startsWith('/') ? '' : '/'}${photo.url}`} alt="Upload" className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => deletePhoto(photo.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-sm"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {photo.isPrimary ? (
                        <span className="absolute bottom-1 left-1 bg-amber-500 text-slate-955 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">Primary</span>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => setPrimaryPhoto(photo.id)}
                          className="absolute bottom-1 left-1 bg-black/60 hover:bg-black/85 text-white text-[8px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Make Primary
                        </button>
                      )}
                    </div>
                  ))}
                  {addMachineForm.photos.length < 3 && (
                    <label className="h-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-amber-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50">
                      <Upload className="h-5 w-5 text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 mt-1">Upload Photo</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handleUploadMachinePhoto} 
                        disabled={uploadingPhoto}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button variant="outline" type="button" onClick={() => navigate('/plant-portal/equipment')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleRegisterMachineSubmit} 
                  disabled={uploadingPhoto || documentUploading}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-black px-6 shadow-sm"
                >
                  Register Machine
                </Button>
              </div>

            </Card>
          </div>

        </div>

      </div>
    );
  };

  const renderMaintenance = () => {
    return (
      <div className="space-y-6 text-left">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Maintenance & Servicing</h1>
            <p className="text-xs text-slate-500 font-medium">Log repairs, schedule services, and monitor equipment health.</p>
          </div>
          <Button onClick={() => setMaintenanceModal(true)} className="gap-2 bg-amber-55 hover:bg-amber-100 border border-amber-200 text-amber-700 font-extrabold">
            <Plus className="h-4 w-4" /> Log Maintenance
          </Button>
        </div>

        <Table headers={['Equipment', 'Issue / Service', 'Date', 'Cost', 'Status']}>
          {maintenance.map((mt) => {
            const eq = equipment.find(e => e.id === mt.equipmentId);
            return (
              <tr key={mt.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-4 px-6 text-left">
                  <div className="font-bold text-slate-800 text-sm">{eq?.name || 'Unknown'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-bold">{eq?.make}</div>
                </td>
                <td className="py-4 px-6 text-left text-sm font-semibold text-slate-700">{mt.issue}</td>
                <td className="py-4 px-6 text-left text-xs text-slate-500">{mt.date}</td>
                <td className="py-4 px-6 text-left text-sm font-black text-slate-800">R {mt.cost.toLocaleString()}</td>
                <td className="py-4 px-6 text-left">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    mt.status === 'completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                    {mt.status?.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>

        <Modal open={maintenanceModal} onClose={() => setMaintenanceModal(false)} title="Log Maintenance">
          <form onSubmit={handleLogMaintenance} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Equipment</label>
              <select 
                required
                className="w-full p-3 bg-slate-55 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
                value={maintenanceForm.equipmentId}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, equipmentId: e.target.value})}
              >
                <option value="">-- Choose Equipment --</option>
                {equipment.filter(e => e.status === 'available').map(e => (
                  <option key={e.id} value={e.id}>{e.name} - {e.make}</option>
                ))}
              </select>
            </div>
            
            <Input 
              label="Issue / Service Description" 
              placeholder="e.g. Hydraulic leak repair" 
              value={maintenanceForm.issue}
              onChange={(e) => setMaintenanceForm({...maintenanceForm, issue: e.target.value})}
              required 
            />
            
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Service Date</label>
              <input 
                type="date" 
                required
                className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-55 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" 
                value={maintenanceForm.date}
                onChange={(e) => setMaintenanceForm({...maintenanceForm, date: e.target.value})}
              />
            </div>

            <Input 
              label="Estimated Cost (ZAR)" 
              type="number" 
              placeholder="e.g. 4500" 
              value={maintenanceForm.cost}
              onChange={(e) => setMaintenanceForm({...maintenanceForm, cost: e.target.value})}
              required 
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-2">
              <Button type="button" variant="outline" onClick={() => setMaintenanceModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white font-bold">Save & Mark Unavailable</Button>
            </div>
          </form>
        </Modal>
      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-6 max-w-4xl text-left">
      <div>
        <h1 className="text-xl font-black text-slate-900">Company ERP Profile</h1>
        <p className="text-xs text-slate-500 font-medium">Manage your enterprise plant hire company details.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); showToast('Profile updated successfully!'); }} className="space-y-6">
        <Card className="space-y-5">
          <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Building className="h-4 w-4 text-amber-500" /> Business Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input label="Registered Company Name" value={profileForm.companyName} onChange={e => setProfileForm({...profileForm, companyName: e.target.value})} required />
            <Input label="Registration Number (CIPC)" value={profileForm.cipcNumber} onChange={e => setProfileForm({...profileForm, cipcNumber: e.target.value})} required />
            <Input label="VAT Number" value={profileForm.vatNumber} onChange={e => setProfileForm({...profileForm, vatNumber: e.target.value})} />
            <Input label="Tax Reference Number" value={profileForm.taxRef} onChange={e => setProfileForm({...profileForm, taxRef: e.target.value})} />
            <Input label="Representative Name" value={profileForm.repName} onChange={e => setProfileForm({...profileForm, repName: e.target.value})} required />
            <Input label="Email Address" type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})} required />
            <Input label="Phone Number" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} required />
            <div className="md:col-span-2">
              <Input label="Headquarters / Yard Address" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} required />
            </div>
          </div>
        </Card>
        
        <div className="flex justify-end gap-4 pb-10">
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-slate-500">Loading plant data...</div>;

  if (plantStatus !== 'ACTIVE' && path !== '/plant-portal/profile') {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
        <ShieldAlert className="h-16 w-16 text-amber-500 mb-6" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Account Not Active</h2>
        <p className="text-slate-600 max-w-md mb-8">
          Your Plant Owner Account is currently <span className="font-bold uppercase">{plantStatus}</span>. You cannot participate in the marketplace or access operational modules until the LoadAfrica Compliance Team verifies and approves your company and machines.
        </p>
        <Button onClick={() => navigate('/plant-portal/compliance')} className="bg-amber-500 hover:bg-amber-600 text-white">
          View Compliance Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0 animate-fadeIn">
      {/* Dynamic Tab Rendering based on sub-routes */}
      {path.endsWith('/dashboard') && renderDashboard()}
      {path.endsWith('/requests') && renderRequests()}
      {path.endsWith('/equipment') && renderEquipment()}
      {path.endsWith('/add-machine') && renderAddMachine()}
      {path.endsWith('/revenue') && renderRevenue()}
      {path.endsWith('/profile') && renderProfile()}

      {/* Global Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 p-4 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-slideUp border ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-900 border-slate-800 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-rose-500" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          <p className="text-sm font-bold">{toast.message}</p>
        </div>
      )}
    </div>
  );

  function renderRevenue() {
    const balance = wallet?.balance || 0;
    const pendingBalance = wallet?.pending_balance || 0;
    
    // Sum of all credits = total earned
    const totalEarned = wallet?.transactions
      ?.filter(t => t.type === 'CREDIT' && t.status === 'COMPLETED')
      ?.reduce((sum, t) => sum + parseFloat(t.amount), 0) || 0;

    return (
      <div className="max-w-5xl mx-auto space-y-6 text-left animate-fadeIn">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Revenue & Splits</h2>
            <p className="text-xs text-slate-400 font-bold mt-1">Track your wallet balance, payout distributions, and platform cuts.</p>
          </div>
          <Button 
            onClick={() => {
              setWithdrawError('');
              setWithdrawSuccess(false);
              setWithdrawAmount('');
              setWithdrawModalOpen(true);
            }}
            disabled={balance <= 0}
            className="bg-amber-500 hover:bg-amber-600 text-slate-955 px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-amber-500/20 disabled:opacity-50 animate-pulse-slow"
          >
            Request Bank Payout
          </Button>
        </div>

        {/* Main cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Available Wallet Balance */}
          <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl flex flex-col justify-between h-40 border border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Balance</p>
                <h3 className="text-3xl font-black mt-1">R {balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Cleared funds, ready for direct bank payout</p>
          </div>

          {/* Pending Payout */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Payouts</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">R {pendingBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                <TrendingUp className="h-5 w-5 text-slate-500" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Processing or awaiting bank settlement</p>
          </div>

          {/* Total Lifetime Net Earnings */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lifetime Payouts</p>
                <h3 className="text-3xl font-black text-slate-800 mt-1">R {totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-emerald-55 flex items-center justify-center border border-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
            <p className="text-[10px] text-emerald-600 font-semibold">Sum of all successfully settled machinery rentals</p>
          </div>

        </div>

        {/* Pricing / Commissions Cuts Explanation */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 space-y-4">
          <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-amber-600" /> How is my net payout calculated?
          </h4>
          <p className="text-xs text-amber-800 font-medium leading-relaxed">
            When the customer makes a payment, LoadAfrica automatically settles the transaction using a split algorithm. For example, on a heavy equipment rental costing **R10,000**:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { title: "1. PLATFORM COMMISSION (12%)", value: "R 1,200", desc: "Kept by LoadAfrica for operations, heavy machinery insurance backup, and gateway costs." },
              { title: "2. BROKER COMMISSION (3%)", value: "R 300", desc: "Earned by the logistics broker who matched, audited compliance, and managed placement." },
              { title: "3. YOUR NET PAYOUT (85%)", value: "R 8,500", desc: "Transferred directly into your plant owner wallet balance upon successful rental contract completion." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white border border-amber-200/60 p-4 rounded-2xl text-left space-y-1 shadow-sm">
                <p className="text-[9px] font-black text-slate-400 tracking-wider">{item.title}</p>
                <p className={`text-lg font-black ${idx === 2 ? 'text-emerald-600' : 'text-slate-800'}`}>{item.value}</p>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History list */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Transaction History</h4>
          </div>

          {!wallet?.transactions || wallet.transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-medium">
              No transactions found yet. Complete a rental job or request a payout to populate transactions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="px-6 py-4">Transaction ID</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Net Amount</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {wallet.transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-mono text-[10px] text-slate-500 tracking-wider">
                        {tx.id}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(tx.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {tx.type === 'CREDIT' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 uppercase text-[9px]">
                            <ArrowUpRight className="h-3 w-3" /> Rental Income
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold border border-amber-100 uppercase text-[9px]">
                            <ArrowDownRight className="h-3 w-3" /> Withdrawal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {tx.description}
                      </td>
                      <td className={`px-6 py-4 font-bold ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                        {tx.type === 'CREDIT' ? '+' : '-'} R {parseFloat(tx.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                          tx.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payout Withdrawal Dialog */}
        {withdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4">
              <div>
                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">Request Payout</h4>
                <p className="text-xs text-slate-400 font-bold mt-1">Cleared funds will be settled into your verified bank account.</p>
              </div>

              {withdrawError && (
                <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <p>{withdrawError}</p>
                </div>
              )}

              {withdrawSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
                  <p>Withdrawal requested successfully!</p>
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Amount (ZAR)</label>
                  <Input 
                    type="number"
                    min="1"
                    step="0.01"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="e.g., 500"
                    required
                  />
                  <p className="text-[9px] text-slate-400 font-semibold mt-1">Available balance: R {balance.toFixed(2)}</p>
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setWithdrawModalOpen(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={withdrawing || withdrawSuccess}
                    className="bg-slate-900 text-white font-bold hover:bg-slate-800"
                  >
                    {withdrawing ? 'Processing...' : 'Confirm Payout'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    );
  };
}
