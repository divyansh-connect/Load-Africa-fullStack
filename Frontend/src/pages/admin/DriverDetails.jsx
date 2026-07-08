import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Mail, Activity, Calendar, Truck, FileText, CreditCard, RefreshCcw } from 'lucide-react';
import { adminService } from '../../services/adminService';

export default function DriverDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await adminService.getUserById(id);
        if (res.success) {
          setUser(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <RefreshCcw className="h-6 w-6 animate-spin mr-2" /> Loading driver details...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12 text-slate-500">
        Driver not found
      </div>
    );
  }

  const wallet = user.wallets && user.wallets.length > 0 ? user.wallets[0] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Driver Details</h1>
          <p className="text-sm text-slate-500 font-medium">ID: {user.id}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> Personal Information
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Full Name:</span> {user.first_name} {user.last_name}</p>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900 flex items-center gap-1"><Phone className="h-3 w-3" /> Phone:</span> {user.phone || 'N/A'}</p>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900 flex items-center gap-1"><Mail className="h-3 w-3" /> Email:</span> {user.email}</p>
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900 flex items-center gap-1"><Calendar className="h-3 w-3" /> Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {user.driver && (
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" /> License & Documentation
                </h3>
                <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                  <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">License Number:</span> {user.driver.license || 'N/A'}</p>
                  <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">ID Document:</span> {user.driver.id_document || 'N/A'}</p>
                  <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">PDP:</span> {user.driver.pdp || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-slate-400" /> Account Status
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Current Status:</span> 
                  <span className={`font-bold px-2 py-0.5 rounded ml-2 ${user.status === 'ACTIVE' ? 'text-green-600 bg-green-100' : 'text-amber-600 bg-amber-100'}`}>
                    {user.status}
                  </span>
                </p>
                {user.driver && (
                  <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Driver Status:</span> {user.driver.status}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" /> Financial Information
              </h3>
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                {wallet ? (
                  <>
                    <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Available Balance:</span> R{Number(wallet.balance).toFixed(2)}</p>
                    <p className="text-sm text-slate-600"><span className="font-semibold text-slate-900">Pending Balance:</span> R{Number(wallet.pending_balance).toFixed(2)}</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-600">No wallet configured.</p>
                )}
                {user.bank_details && (
                  <div className="mt-4 border-t border-slate-200 pt-2">
                    <p className="text-xs font-bold text-slate-500 uppercase">Bank Details</p>
                    <pre className="text-xs text-slate-600 whitespace-pre-wrap">{JSON.stringify(user.bank_details, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
