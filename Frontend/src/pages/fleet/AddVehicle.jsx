import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Upload, X, Image, CheckCircle2, AlertCircle,
  FileText, Camera, Truck
} from 'lucide-react';
import { fleetService } from '../../services/fleetService';
import { VEHICLE_TYPES, getVehicleImage } from '../../constants/vehicleTypes';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => CURRENT_YEAR - i);

const Field = ({ label, required, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-semibold text-slate-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

const inputCls = "w-full h-11 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-white transition-all";
const selectCls = `${inputCls} cursor-pointer`;

export default function AddVehicle() {
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [docUploading, setDocUploading] = useState({});

  const [form, setForm] = useState({
    registration_number: '',
    vehicle_type: '',
    capacity: '',
    brand: '',
    model: '',
    year: '',
    vin: '',
    insurance_expiry: '',
    fitness_expiry: '',
    insurance_document: '',
    registration_document: '',
    fitness_document: '',
  });

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  // ── Photo handling ─────────────────────────────
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Only JPG, PNG or WEBP images are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be under 5MB.');
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    // Upload immediately for URL
    setUploadingPhoto(true);
    try {
      const res = await fleetService.uploadFile(file);
      if (res.success && res.data?.urls?.[0]) {
        setUploadedPhotoUrl(res.data.urls[0]);
      }
    } catch (err) {
      setPhotoError('Photo upload failed. You can still save — the photo will be skipped.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
    setUploadedPhotoUrl('');
    setPhotoError('');
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  // ── Document upload ────────────────────────────
  const handleDocUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(p => ({ ...p, [field]: true }));
    try {
      const res = await fleetService.uploadFile(file);
      if (res.success && res.data?.urls?.[0]) {
        setForm(p => ({ ...p, [field]: res.data.urls[0] }));
      }
    } catch (err) {
      console.error('Doc upload failed:', err);
    } finally {
      setDocUploading(p => ({ ...p, [field]: false }));
    }
  };

  // ── Form submit ────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.registration_number.trim()) return setError('Registration Number is required.');
    if (!form.vehicle_type) return setError('Vehicle Type is required.');
    if (!form.capacity) return setError('Capacity is required.');

    setLoading(true);
    try {
      const payload = {
        ...form,
        capacity: parseFloat(form.capacity),
        year: form.year ? parseInt(form.year) : undefined,
        photo_url: uploadedPhotoUrl || undefined,
      };
      const res = await fleetService.addVehicle(payload);
      if (!res.success) throw new Error(res.message);
      setSuccess(true);
      setTimeout(() => navigate('/fleet-portal/vehicles'), 1800);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add vehicle.');
    } finally {
      setLoading(false);
    }
  };

  const defaultImg = form.vehicle_type ? getVehicleImage(null, form.vehicle_type) : null;

  return (
    <div className="min-h-full bg-slate-50/50">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/fleet-portal/vehicles')}
            className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add New Vehicle</h1>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Register a vehicle to your fleet</p>
          </div>
        </div>

        {/* Success */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <p className="text-sm font-bold text-emerald-800">Vehicle registered! Redirecting to My Fleet…</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── PHOTO UPLOAD ─────────────────────────── */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-500" /> Vehicle Photo
              <span className="text-xs font-normal text-slate-400 ml-1">(Optional)</span>
            </h2>

            {photoPreview ? (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-52">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="text-white text-sm font-bold ml-2">Uploading…</span>
                    </div>
                  )}
                  {uploadedPhotoUrl && !uploadingPhoto && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    className="flex-1 py-2 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Replace Photo
                  </button>
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="px-4 py-2 text-sm font-bold text-red-500 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-amber-400 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                >
                  {defaultImg ? (
                    <div className="space-y-3">
                      <img src={defaultImg} alt="Default" className="h-28 w-full object-cover rounded-xl mx-auto opacity-40" />
                      <div>
                        <p className="text-sm font-bold text-slate-600 group-hover:text-amber-600">Click to upload vehicle photo</p>
                        <p className="text-xs text-slate-400 mt-1">Default image shown above will be used if no photo uploaded</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto group-hover:bg-amber-50 transition-colors">
                        <Image className="w-6 h-6 text-slate-400 group-hover:text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-600 group-hover:text-amber-600">Click to upload vehicle photo</p>
                        <p className="text-xs text-slate-400 mt-1">JPG, PNG or WEBP · Max 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {!defaultImg && (
                  <p className="text-xs text-slate-400 text-center mt-2">Select a Vehicle Type below to preview the default image</p>
                )}
              </div>
            )}

            {photoError && (
              <p className="text-xs text-red-500 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {photoError}
              </p>
            )}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </section>

          {/* ── VEHICLE DETAILS ───────────────────────── */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" /> Vehicle Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Vehicle Type" required>
                <select name="vehicle_type" value={form.vehicle_type} onChange={onChange} required className={selectCls}>
                  <option value="">Select vehicle type...</option>
                  {VEHICLE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Registration Number" required>
                <input name="registration_number" value={form.registration_number} onChange={onChange} required placeholder="e.g. GP 12 ABC" className={inputCls} />
              </Field>

              <Field label="Capacity (Tons)" required>
                <input name="capacity" value={form.capacity} onChange={onChange} required type="number" min="0" step="0.1" placeholder="e.g. 8" className={inputCls} />
              </Field>

              <Field label="Brand / Make">
                <input name="brand" value={form.brand} onChange={onChange} placeholder="e.g. Scania, Mercedes-Benz" className={inputCls} />
              </Field>

              <Field label="Model">
                <input name="model" value={form.model} onChange={onChange} placeholder="e.g. R500, Actros" className={inputCls} />
              </Field>

              <Field label="Year">
                <select name="year" value={form.year} onChange={onChange} className={selectCls}>
                  <option value="">Select year...</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>

              <Field label="VIN / Chassis Number" hint="Must be unique across the platform">
                <input name="vin" value={form.vin} onChange={onChange} placeholder="Required for verification" className={inputCls} />
              </Field>
            </div>
          </section>

          {/* ── COMPLIANCE DATES ──────────────────────── */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" /> Compliance & Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Insurance Expiry Date">
                <input name="insurance_expiry" value={form.insurance_expiry} onChange={onChange} type="date" className={inputCls} />
              </Field>

              <Field label="Road Fitness Expiry">
                <input name="fitness_expiry" value={form.fitness_expiry} onChange={onChange} type="date" className={inputCls} />
              </Field>
            </div>

            {/* Document Uploads */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {[
                { label: 'Insurance Policy', field: 'insurance_document', accept: '.pdf,.jpg,.png' },
                { label: 'Registration / RC', field: 'registration_document', accept: '.pdf,.jpg,.png' },
                { label: 'Fitness Certificate', field: 'fitness_document', accept: '.pdf,.jpg,.png' },
              ].map(({ label, field, accept }) => (
                <div key={field} className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
                  {form[field] ? (
                    <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs font-medium text-emerald-700 truncate">Uploaded</span>
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, [field]: '' }))}
                        className="ml-auto text-emerald-400 hover:text-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                      {docUploading[field] ? (
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 text-slate-400" />
                      )}
                      <span className="text-xs font-medium text-slate-500">
                        {docUploading[field] ? 'Uploading...' : 'Upload file'}
                      </span>
                      <input
                        type="file"
                        accept={accept}
                        onChange={e => handleDocUpload(e, field)}
                        className="hidden"
                        disabled={docUploading[field]}
                      />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Submit */}
          <div className="flex gap-3 justify-end pb-8">
            <button
              type="button"
              onClick={() => navigate('/fleet-portal/vehicles')}
              className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || success}
              className="px-8 py-2.5 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-60 transition-all flex items-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> Saving…</>
              ) : 'Save & Register Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
