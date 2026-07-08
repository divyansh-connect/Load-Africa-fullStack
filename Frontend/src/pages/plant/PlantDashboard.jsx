import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HardHat, DollarSign, CheckCircle2, Clock, Plus, ChevronRight, MapPin, ArrowRight,
  TrendingUp, AlertCircle, Trash2, Edit2, ShieldAlert, Calendar, User, Key, Mail, Building,
  FileText, Star, Wrench, Download, Settings, Loader2, Filter, Search, MoreVertical,
  Activity, BarChart3, ArrowUpRight, Check, X
} from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';
import { Modal, Button, Input, Card, Table, StatCard } from '../../components/ui';
import { plantService } from '../../services/plantService';

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
      const res = await plantService.getDashboard();
      if (res.success && res.data) {
        setPlantStatus(res.data.status);
      }
    } catch (err) {
      console.error(err);
    }

    setEquipment(getMockData('equipment') || []);
    setOperators(getMockData('operators') || []);
    setHireRequests(getMockData('hireRequests') || []);
    setMaintenance(getMockData('maintenance') || []);
    setPayments(getMockData('payments') || []);
    setLoading(false);
  };

  // Derived Stats
  const totalEquipment = equipment.length;
  const onHireEquipment = equipment.filter(e => e.status === 'on_hire').length;
  const availableEquipment = equipment.filter(e => e.status === 'available').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'maintenance').length;
  const pendingRequests = hireRequests.filter(h => h.status === 'pending').length;
  const availableOperators = operators.filter(o => o.status === 'available').length;
  
  const utilizationPercent = totalEquipment > 0 ? Math.round((onHireEquipment / totalEquipment) * 100) : 0;
  const availabilityPercent = totalEquipment > 0 ? Math.round((availableEquipment / totalEquipment) * 100) : 0;
  
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
                  <div key={eq.id} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
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
                      <p className="text-[10px] font-medium text-slate-500">Op: {operator ? operator.name : 'None'}</p>
                    </div>
                  </div>
                );
              })}
              {equipment.filter(e => e.status === 'on_hire').length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm bg-slate-50 rounded-xl">No active rentals currently.</div>
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
                  <p className="text-xs font-bold text-slate-800">Registration Expiring</p>
                  <p className="text-[10px] text-rose-700 mt-0.5">TLB (Backhoe Loader) expires in 14 days.</p>
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
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => setRejectModal({ open: true, request: req })}>Reject</Button>
                      <Button size="sm" className="flex-1 sm:flex-none" onClick={() => { setWizardModal({ open: true, request: req }); setWizardStep(1); }}>Assign Wizard</Button>
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
            <p className="text-sm text-slate-500 mt-2">All caught up! No pending requests.</p>
          </div>
        )}

        {/* Enterprise Assignment Wizard */}
        {wizardModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Wizard Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Assignment Wizard</h2>
                  <p className="text-xs text-slate-500">Step {wizardStep} of 4</p>
                </div>
                <button onClick={() => setWizardModal({open: false, request: null})} className="text-slate-400 hover:text-slate-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Wizard Content */}
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
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><HardHat className="h-4 w-4 text-amber-500"/> Select Equipment</h3>
                    <p className="text-xs text-slate-500">Only showing equipment currently Available.</p>
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
                  <div className="space-y-4 animate-fadeIn">
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
                            <p className="text-[10px] text-slate-500 mt-0.5">Rating: {op.rating}★ • Certified</p>
                          </div>
                          {assignModal.operatorId === op.id && <CheckCircle2 className="h-5 w-5 text-amber-600" />}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {wizardStep === 4 && (
                  <div className="space-y-4 animate-fadeIn">
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

              {/* Wizard Footer */}
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
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleConfirmAssignment}>
                    Confirm Assignment
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reject Modal */}
        <Modal open={rejectModal.open} onClose={() => setRejectModal({ open: false, request: null })} title="Reject Hire Request">
          <div className="space-y-5">
            <p className="text-sm text-slate-600">Are you sure you want to reject the hire request for <span className="font-bold text-slate-800">{rejectModal.request?.machine}</span>?</p>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Reason for Rejection *</label>
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-rose-500" 
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
          <Button onClick={() => navigate('/plant-portal/add-machine')} className="gap-2">
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
            className="h-10 px-4 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-500"
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
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <img src={eq.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=80&auto=format&fit=crop&q=80'} alt="Machine" className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
                    <div>
                      <div className="font-bold text-slate-800 text-sm">{eq.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{eq.make}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className="text-xs font-semibold text-slate-700">R {eq.rate}/hr</span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    eq.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                    eq.status === 'on_hire' ? 'bg-blue-100 text-blue-700' :
                    eq.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {eq.status?.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedMachine(eq); }} className="text-amber-600">
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
      <div className="space-y-6 animate-scaleIn">
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
              <img src={eq.image || 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=400&auto=format&fit=crop&q=80'} alt="Machine" className="w-full h-48 object-cover" />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{eq.make}</h3>
                    <p className="text-sm text-slate-500">{eq.name}</p>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    eq.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                    eq.status === 'on_hire' ? 'bg-blue-100 text-blue-700' :
                    eq.status === 'maintenance' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-600'
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
                    <span className="text-xs text-slate-500 font-bold">Engine Hours</span>
                    <span className="text-sm font-semibold text-slate-800">1,240 hrs</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-500" /> Compliance & Documents
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Insurance</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Approved</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Registration</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Approved</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Fitness / Inspection</p>
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Expiring Soon</p>
                  </div>
                  <AlertCircle className="h-5 w-5 text-amber-500" />
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
                      <p className="text-xs font-bold text-slate-800">{mt.issue}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{mt.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-800 mb-1">R {mt.cost.toLocaleString()}</p>
                      <span className={`text-[10px] font-bold uppercase ${mt.status === 'completed' ? 'text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded' : 'text-amber-600 bg-amber-50 px-2 py-0.5 rounded'}`}>{mt.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
                {maintenance.filter(m => m.equipmentId === eq.id).length === 0 && (
                  <p className="text-xs text-slate-500 text-center py-4">No maintenance history recorded.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

  const renderAddMachine = () => {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-xl font-black text-slate-900">Add New Machine</h1>
          <p className="text-xs text-slate-500 font-medium">Enterprise equipment registration form.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); showToast('Equipment added successfully!'); navigate('/plant-portal/equipment'); }} className="space-y-5">
          <Card className="space-y-4 p-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <HardHat className="h-4 w-4 text-amber-500"/> Core Specifications
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category *</label>
                <select className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all">
                  <option>Excavator</option>
                  <option>TLB</option>
                  <option>Grader</option>
                  <option>Crane</option>
                  <option>Compactor</option>
                </select>
              </div>
              <Input label="Manufacturer (Make) *" placeholder="e.g. Caterpillar" required />
              <Input label="Model *" placeholder="e.g. 320 GC" required />
              <Input label="Year of Manufacture" placeholder="e.g. 2021" type="number" />
              <Input label="Operating Weight / Capacity" placeholder="e.g. 20 Tons" required />
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fuel Type</label>
                <select className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option>Diesel</option>
                  <option>Petrol</option>
                  <option>Electric</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Key className="h-4 w-4 text-amber-500"/> Identifiers & Pricing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="VIN / Serial Number *" placeholder="Required for tracking" required />
              <Input label="Engine Number" placeholder="Optional" />
              <Input label="Registration Number" placeholder="e.g. GP 1234" />
              <Input label="Hourly Rate (ZAR) *" type="number" placeholder="e.g. 1200" required />
              <Input label="Daily Rate (ZAR)" type="number" placeholder="e.g. 9600" />
              <Input label="Monthly Rate (ZAR)" type="number" placeholder="e.g. 250000" />
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-500"/> Compliance & Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insurance Policy (PDF)</label>
                <input type="file" accept=".pdf" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Insurance Expiry Date</label>
                <input type="date" className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" required />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inspection / Fitness Cert (PDF)</label>
                <input type="file" accept=".pdf,.jpg,.png" className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-600 hover:file:bg-amber-100" />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inspection Expiry Date</label>
                <input type="date" className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" required />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-4 pb-10">
            <Button variant="outline" type="button" onClick={() => navigate('/plant-portal/equipment')}>Cancel</Button>
            <Button type="submit">Save & Sync Global State</Button>
          </div>
        </form>
      </div>
    );
  };

  const renderRevenue = () => {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-black text-slate-900">Finance & Revenue Dashboard</h1>
          <p className="text-xs text-slate-500 font-medium">Enterprise financial tracking across all equipment.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Revenue" value={`R ${monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="emerald" />
          <StatCard title="Pending Payments" value={`R ${payments.filter(p=>p.status==='pending').reduce((s,p)=>s+p.amount,0).toLocaleString()}`} icon={Clock} color="amber" />
          <StatCard title="Completed Rentals" value={payments.filter(p=>p.status==='completed').length} icon={CheckCircle2} color="blue" />
          <StatCard title="Withdrawable Balance" value={`R ${(monthlyRevenue * 0.9).toLocaleString()}`} icon={ArrowUpRight} color="indigo" />
        </div>

        <Card>
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-amber-500"/> Transaction History</h3>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => showToast('Statement downloaded.', 'success')}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-slate-400 font-bold uppercase border-b border-slate-100">
                  <th className="pb-3">Transaction ID</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 font-mono text-xs">{p.id}</td>
                    <td className="py-4">{p.date}</td>
                    <td className="py-4">{p.customerName}</td>
                    <td className="py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 text-right font-black text-slate-900">R {p.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  };

  const renderMaintenance = () => {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-black text-slate-900">Maintenance & Servicing</h1>
            <p className="text-xs text-slate-500 font-medium">Log repairs, schedule services, and monitor equipment health.</p>
          </div>
          <Button onClick={() => setMaintenanceModal(true)} className="gap-2 bg-amber-600 hover:bg-amber-500 text-white">
            <Plus className="h-4 w-4" /> Log Maintenance
          </Button>
        </div>

        <Table headers={['Equipment', 'Issue / Service', 'Date', 'Cost', 'Status']}>
          {maintenance.map((mt) => {
            const eq = equipment.find(e => e.id === mt.equipmentId);
            return (
              <tr key={mt.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-4 px-6">
                  <div className="font-bold text-slate-800 text-sm">{eq?.name || 'Unknown'}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{eq?.make}</div>
                </td>
                <td className="py-4 px-6 text-sm font-semibold text-slate-700">{mt.issue}</td>
                <td className="py-4 px-6 text-xs text-slate-500">{mt.date}</td>
                <td className="py-4 px-6 text-sm font-black text-slate-800">R {mt.cost.toLocaleString()}</td>
                <td className="py-4 px-6">
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    mt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {mt.status?.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            );
          })}
        </Table>

        {/* Log Maintenance Modal */}
        <Modal open={maintenanceModal} onClose={() => setMaintenanceModal(false)} title="Log Maintenance">
          <form onSubmit={handleLogMaintenance} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select Equipment</label>
              <select 
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                className="w-full h-11 px-4 border border-slate-200 rounded-xl bg-slate-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500" 
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
              <Button type="submit" className="bg-amber-600 hover:bg-amber-500 text-white">Save & Mark Unavailable</Button>
            </div>
          </form>
        </Modal>

      </div>
    );
  };

  const renderProfile = () => (
    <div className="space-y-6 max-w-4xl">
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
            <Input label="Registered Company Name" defaultValue="Motsepe Plant Hire (Pty) Ltd" required />
            <Input label="Registration Number (CIPC)" defaultValue="2022/123456/07" required />
            <Input label="VAT Number" defaultValue="4123456789" />
            <Input label="Tax Reference Number" defaultValue="9123456789" />
            <Input label="Representative Name" defaultValue="Patrice Motsepe" required />
            <Input label="Email Address" type="email" defaultValue="admin@motsepeplant.co.za" required />
            <Input label="Phone Number" defaultValue="+27 82 111 2222" required />
            <div className="md:col-span-2">
              <Input label="Headquarters / Yard Address" defaultValue="123 Industrial Park, Sandton, 2196" required />
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
      {path.endsWith('/maintenance') && renderMaintenance()}
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
}
