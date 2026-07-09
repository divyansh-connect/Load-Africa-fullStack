import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Camera, Upload, X, CheckCircle2, AlertCircle, User
} from 'lucide-react';
import { Input, Button, Card } from '../../components/ui';
import { fleetService } from '../../services/fleetService';

const inputCls = "w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all";

export default function EditDriver() {
  const { id } = useParams();
  const navigate = useNavigate();
  const photoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    license: '',
    license_expiry: '',
    driving_category: '',
    national_id: '',
    address: '',
    status: 'ACTIVE',
  });

  useEffect(() => { fetchDriver(); }, [id]);

  const fetchDriver = async () => {
    try {
      const res = await fleetService.getDrivers();
      if (res.success) {
        const d = res.data.find(d => d.id === id);
        if (d) {
          setForm({
            first_name: d.user?.first_name || '',
            last_name: d.user?.last_name || '',
            email: d.user?.email || '',
            phone: d.user?.phone || '',
            license: d.license || '',
            license_expiry: d.license_expiry ? d.license_expiry.split('T')[0] : '',
            driving_category: d.driving_category || '',
            national_id: d.national_id || '',
            address: d.address || '',
            status: d.user?.status || 'ACTIVE',
          });
          if (d.user?.avatar) {
            const src = d.user.avatar.startsWith('http') ? d.user.avatar : `http://localhost:5000${d.user.avatar}`;
            setPhotoPreview(src);
            setUploadedPhotoUrl(d.user.avatar);
          }
        }
      }
    } catch (e) {
      setError('Failed to load driver data.');
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return setPhotoError('Only JPG, PNG or WEBP allowed.');
    }
    if (file.size > 5 * 1024 * 1024) return setPhotoError('Image must be under 5MB.');
    setPhotoPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    try {
      const res = await fleetService.uploadFile(file);
      if (res.success && res.data?.urls?.[0]) setUploadedPhotoUrl(res.data.urls[0]);
    } catch { setPhotoError('Upload failed.'); }
    finally { setUploadingPhoto(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        avatar: uploadedPhotoUrl || undefined,
      };
      const res = await fleetService.updateDriver(id, payload);
      if (!res.success) throw new Error(res.message);
      setSuccess(true);
      setTimeout(() => navigate('/fleet-portal/drivers'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50/50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/fleet-portal/drivers')}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Driver</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">{form.first_name} {form.last_name}</p>
          </div>
        </div>

        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-bold text-emerald-800">Driver updated! Redirecting…</p>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-500" /> Driver Photo
              <span className="text-xs font-normal text-slate-400">(Optional)</span>
            </h2>
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200 flex-shrink-0">
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 text-slate-300" />
                    </div>
                }
                {uploadingPhoto && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => photoRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors">
                  <Upload className="w-4 h-4" /> {photoPreview ? 'Replace Photo' : 'Upload Photo'}
                </button>
                {photoPreview && (
                  <button type="button" onClick={() => { setPhotoPreview(null); setUploadedPhotoUrl(''); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors">
                    <X className="w-4 h-4" /> Remove
                  </button>
                )}
                <p className="text-xs text-slate-400">JPG, PNG or WEBP · Max 5MB</p>
                {photoError && <p className="text-xs text-red-500">{photoError}</p>}
              </div>
              <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
            </div>
          </section>

          {/* Personal Details */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-500" /> Personal Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">First Name <span className="text-red-500">*</span></label>
                <input name="first_name" value={form.first_name} onChange={onChange} required className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                <input name="last_name" value={form.last_name} onChange={onChange} required className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                <input name="email" type="email" value={form.email} onChange={onChange} required className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                <input name="phone" value={form.phone} onChange={onChange} required className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">National ID</label>
                <input name="national_id" value={form.national_id} onChange={onChange} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Address</label>
                <input name="address" value={form.address} onChange={onChange} className={inputCls} />
              </div>
            </div>
          </section>

          {/* License */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500" /> License & Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">License Number <span className="text-red-500">*</span></label>
                <input name="license" value={form.license} onChange={onChange} required className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">License Expiry Date</label>
                <input name="license_expiry" type="date" value={form.license_expiry} onChange={onChange} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Driving Category</label>
                <select name="driving_category" value={form.driving_category} onChange={onChange} className={inputCls + ' cursor-pointer'}>
                  <option value="">Select Category</option>
                  <option value="Light Motor Vehicle (LMV)">Light Motor Vehicle (LMV)</option>
                  <option value="Heavy Commercial Vehicle (HCV)">Heavy Commercial Vehicle (HCV)</option>
                  <option value="Extra Heavy Commercial Vehicle (EHCV)">Extra Heavy Commercial Vehicle (EHCV)</option>
                  <option value="Dangerous Goods (Hazchem)">Dangerous Goods (Hazchem)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Account Status</label>
                <select name="status" value={form.status} onChange={onChange} className={inputCls + ' cursor-pointer'}>
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex gap-3 justify-end pb-8">
            <button type="button" onClick={() => navigate('/fleet-portal/drivers')}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={saving || success}
              className="px-8 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-60 transition-all flex items-center gap-2">
              {saving ? <><div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
