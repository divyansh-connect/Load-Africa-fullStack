import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { fleetService } from '../../services/fleetService';

const inputCls = "w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all";

export default function AddDriver() {
  const navigate = useNavigate();
  const photoRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    license: '',
    license_expiry: '',
    driving_category: '',
    national_id: '',
    address: '',
    status: 'ACTIVE'
  });

  const handleChange = (e) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

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
    if (formData.password !== formData.confirm_password) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      const payload = {
        ...formData,
        avatar: uploadedPhotoUrl || undefined,
      };
      const data = await fleetService.addDriver(payload);
      if (!data.success) throw new Error(data.message);
      setSuccess(true);
      setTimeout(() => navigate('/fleet-portal/drivers'), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Driver</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Register a new driver to your fleet</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl font-medium flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl font-medium flex items-start gap-3 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Driver registered successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Driver Photo */}
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
                  <Upload className="w-4 h-4" />
                  {photoPreview ? 'Replace Photo' : 'Upload Photo'}
                </button>
                {photoPreview && (
                  <button type="button" onClick={() => { setPhotoPreview(null); setUploadedPhotoUrl(''); if (photoRef.current) photoRef.current.value = ''; }}
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
                <input name="first_name" required onChange={handleChange} className={inputCls} placeholder="e.g. Amuu" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Last Name <span className="text-red-500">*</span></label>
                <input name="last_name" required onChange={handleChange} className={inputCls} placeholder="e.g. Goswami" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
                <input name="email" type="email" required onChange={handleChange} className={inputCls} placeholder="driver@email.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
                <input name="phone" required onChange={handleChange} className={inputCls} placeholder="+27 XX XXX XXXX" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
                <input name="password" type="password" required onChange={handleChange} className={inputCls} placeholder="Minimum 6 characters" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Confirm Password <span className="text-red-500">*</span></label>
                <input name="confirm_password" type="password" required onChange={handleChange} className={inputCls} placeholder="Re-enter password" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">National ID</label>
                <input name="national_id" onChange={handleChange} className={inputCls} placeholder="ID number" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Address</label>
                <input name="address" onChange={handleChange} className={inputCls} placeholder="Home address" />
              </div>
            </div>
          </section>

          {/* License & Category */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-500" /> License & Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Driving License Number <span className="text-red-500">*</span></label>
                <input name="license" required onChange={handleChange} className={inputCls} placeholder="License number" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">License Expiry Date <span className="text-red-500">*</span></label>
                <input name="license_expiry" type="date" required onChange={handleChange} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Driving Category <span className="text-red-500">*</span></label>
                <select name="driving_category" required onChange={handleChange} className={inputCls + ' cursor-pointer'}>
                  <option value="">Select Category</option>
                  <option value="Light Motor Vehicle (LMV)">Light Motor Vehicle (LMV)</option>
                  <option value="Heavy Commercial Vehicle (HCV)">Heavy Commercial Vehicle (HCV)</option>
                  <option value="Extra Heavy Commercial Vehicle (EHCV)">Extra Heavy Commercial Vehicle (EHCV)</option>
                  <option value="Dangerous Goods (Hazchem)">Dangerous Goods (Hazchem)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Account Status</label>
                <select name="status" onChange={handleChange} className={inputCls + ' cursor-pointer'}>
                  <option value="ACTIVE">Active (Ready to login)</option>
                  <option value="PENDING">Pending (Inactive for now)</option>
                </select>
              </div>
            </div>
          </section>

          <div className="flex gap-3 justify-end pb-8">
            <button type="button" onClick={() => navigate('/fleet-portal/drivers')}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || success}
              className="px-8 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-60 transition-all">
              {loading ? 'Saving Driver...' : 'Save Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
