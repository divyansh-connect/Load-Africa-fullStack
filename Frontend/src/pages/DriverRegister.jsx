import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, ShieldCheck, Mail, MessageSquare, Phone, Calendar, Shield, User,
  MapPin, ArrowRight, Upload, CheckCircle, ChevronDown, Camera, AlertCircle, X, Check, Crop, RefreshCw
} from 'lucide-react';
import { Card, Input } from '../components/ui';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authService } from '../services/authService';
import api from '../services/api';

const VEHICLE_TYPES = [
  'Bakkie',
  'Flatbed Truck',
  'Crane Truck',
  'Tipper Truck',
  'Tanker',
  'Box Truck',
  'Curtain-Side Truck',
  'Bakkie - Coldroom'
];

const PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'North West',
  'Northern Cape',
  'Western Cape'
];

export default function DriverRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dropdown states
  const [provinceOpen, setProvinceOpen] = useState(false);
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [fleetOpen, setFleetOpen] = useState(false);

  // References
  const provinceRef = useRef(null);
  const vehicleRef = useRef(null);
  const fleetRef = useRef(null);

  // Fleet Owner Companies List
  const [fleetCompanies, setFleetCompanies] = useState([]);

  // Cropper state
  const [croppingFileKey, setCroppingFileKey] = useState(null); // 'profilePhoto', 'selfie', etc.
  const [cropSrc, setCropSrc] = useState(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 1. Account Details Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // 2. Profile Details Form
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('Gauteng');
  const [city, setCity] = useState('');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

  // 3. Vehicle Details Form
  const [driverType, setDriverType] = useState('INDEPENDENT'); // INDEPENDENT or FLEET
  const [selectedFleetId, setSelectedFleetId] = useState('');
  const [selectedFleetName, setSelectedFleetName] = useState('');
  const [vehicleType, setVehicleType] = useState('Bakkie');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vin, setVin] = useState('');
  const [capacity, setCapacity] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [insuranceStatus, setInsuranceStatus] = useState('Active');
  const [roadworthyStatus, setRoadworthyStatus] = useState('Valid');
  const [licenseDiscStatus, setLicenseDiscStatus] = useState('Valid');

  // 4. KYC / Documents File Uploads
  // Key format: { file: File, preview: string }
  const [uploads, setUploads] = useState({
    profilePhoto: null,
    selfie: null,
    govtId: null,
    licenseFront: null,
    licenseBack: null,
    policeClearance: null,
    medicalCertificate: null,
    proofOfAddress: null,
    vehicleRegistration: null,
    insuranceDoc: null,
    roadworthyDoc: null
  });

  const [nationalId, setNationalId] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('');

  // Load active approved fleet owners
  useEffect(() => {
    async function loadFleets() {
      try {
        const res = await api.get('/auth/fleet-owners/approved');
        if (res.data.success) {
          setFleetCompanies(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load fleet owners list', err);
      }
    }
    loadFleets();
  }, []);

  // Click outside click listener for custom dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (provinceRef.current && !provinceRef.current.contains(e.target)) setProvinceOpen(false);
      if (vehicleRef.current && !vehicleRef.current.contains(e.target)) setVehicleOpen(false);
      if (fleetRef.current && !fleetRef.current.contains(e.target)) setFleetOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Image compression logic
  const handleFileCompress = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1000;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const compressed = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve({
              file: compressed,
              preview: URL.createObjectURL(compressed)
            });
          }, 'image/jpeg', 0.75);
        };
      };
    });
  };

  // Geolocation trigger
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLng(position.coords.longitude);
        },
        (err) => {
          alert('Could not retrieve GPS coordinates automatically. Please input address province/city.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // Drag & drop logic
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = async (e, key) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      await processUploadedFile(file, key);
    }
  };

  const processUploadedFile = async (file, key) => {
    if (!file.type.match('image.*') && !file.type.match('application/pdf')) {
      alert('Only image or PDF files are accepted.');
      return;
    }

    if (file.type.match('image.*')) {
      const compressed = await handleFileCompress(file);
      setUploads(prev => ({
        ...prev,
        [key]: compressed
      }));
    } else {
      // PDF file - no compression or cropping
      setUploads(prev => ({
        ...prev,
        [key]: {
          file: file,
          preview: 'PDF_FILE'
        }
      }));
    }
  };

  const handleFileSelect = async (e, key) => {
    const file = e.target.files[0];
    if (file) {
      await processUploadedFile(file, key);
    }
  };

  const removeFile = (key) => {
    setUploads(prev => ({
      ...prev,
      [key]: null
    }));
  };

  // Cropper implementation (slider zooming + mouse drag offset)
  const openCropper = (key) => {
    const item = uploads[key];
    if (item && item.preview !== 'PDF_FILE') {
      setCroppingFileKey(key);
      setCropSrc(item.preview);
      setCropZoom(1);
      setCropOffset({ x: 0, y: 0 });
    }
  };

  const closeCropper = () => {
    setCroppingFileKey(null);
    setCropSrc(null);
  };

  const handleCropMouseDown = (e) => {
    setIsDraggingCrop(true);
    setDragStart({ x: e.clientX - cropOffset.x, y: e.clientY - cropOffset.y });
  };

  const handleCropMouseMove = (e) => {
    if (!isDraggingCrop) return;
    setCropOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleCropMouseUp = () => {
    setIsDraggingCrop(false);
  };

  const applyCrop = () => {
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = cropSrc;
    img.onload = () => {
      // Clear background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, size, size);

      // Draw cropped area based on zoom & offset
      const sw = img.width / cropZoom;
      const sh = img.height / cropZoom;
      const sx = (img.width - sw) / 2 - (cropOffset.x * sw) / size;
      const sy = (img.height - sh) / 2 - (cropOffset.y * sh) / size;

      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);

      canvas.toBlob((blob) => {
        const croppedFile = new File([blob], `cropped-${croppingFileKey}.jpg`, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });

        setUploads(prev => ({
          ...prev,
          [croppingFileKey]: {
            file: croppedFile,
            preview: URL.createObjectURL(croppedFile)
          }
        }));

        closeCropper();
      }, 'image/jpeg', 0.85);
    };
  };

  // Form submission handler
  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Upload files first
      const fileUrls = {};
      for (const [key, val] of Object.entries(uploads)) {
        if (val) {
          const formData = new FormData();
          formData.append('files', val.file);
          const response = await authService.uploadFile(formData);
          if (response.success && response.data.urls.length > 0) {
            fileUrls[key] = response.data.urls[0];
          }
        }
      }

      // 2. Format request payload
      const payload = {
        email,
        password,
        fullName,
        phone,
        profile: {
          dob: dob || null,
          gender: gender || null,
          emergencyContactName: emergencyName || null,
          emergencyContactPhone: emergencyPhone || null,
          address: address || null,
          province: province || null,
          city: city || null,
          lat: parseFloat(lat) || null,
          lng: parseFloat(lng) || null
        },
        kyc: {
          nationalId: nationalId || null,
          licenseNumber: licenseNumber || null,
          licenseExpiry: licenseExpiry || null
        },
        vehicle: {
          driverType,
          fleetOwnerId: driverType === 'FLEET' ? selectedFleetId : null,
          vehicleType: driverType === 'INDEPENDENT' ? vehicleType : null,
          registrationNumber: driverType === 'INDEPENDENT' ? registrationNumber : null,
          vin: driverType === 'INDEPENDENT' ? vin : null,
          capacity: driverType === 'INDEPENDENT' ? parseFloat(capacity) : null,
          manufacturer: driverType === 'INDEPENDENT' ? manufacturer : null,
          model: driverType === 'INDEPENDENT' ? model : null,
          year: driverType === 'INDEPENDENT' ? parseInt(year) : null,
          insurance: driverType === 'INDEPENDENT' ? insuranceStatus : null,
          roadworthy: driverType === 'INDEPENDENT' ? roadworthyStatus : null,
          licenseDisc: driverType === 'INDEPENDENT' ? licenseDiscStatus : null
        },
        documents: {
          profilePhoto: fileUrls.profilePhoto || null,
          selfie: fileUrls.selfie || null,
          govtId: fileUrls.govtId || null,
          licenseFront: fileUrls.licenseFront || null,
          licenseBack: fileUrls.licenseBack || null,
          policeClearance: fileUrls.policeClearance || null,
          medicalCertificate: fileUrls.medicalCertificate || null,
          proofOfAddress: fileUrls.proofOfAddress || null,
          vehicleRegistration: fileUrls.vehicleRegistration || null,
          insuranceDoc: fileUrls.insuranceDoc || null,
          roadworthyDoc: fileUrls.roadworthyDoc || null
        }
      };

      // 3. Post to backend
      const res = await authService.registerDriver(payload);
      if (res.success) {
        setStep(5);
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while saving your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans relative selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        {/* Progress header bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-400 mb-8 select-none">
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${step >= 1 ? 'bg-amber-500 text-slate-955' : 'bg-slate-200 text-slate-500'}`}>1</span>
            <span className={step === 1 ? 'text-slate-900 font-black' : ''}>Create Account</span>
          </div>
          <span className="h-px w-6 bg-slate-300"></span>
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${step >= 2 ? 'bg-amber-500 text-slate-955' : 'bg-slate-200 text-slate-500'}`}>2</span>
            <span className={step === 2 ? 'text-slate-900 font-black' : ''}>Driver Profile</span>
          </div>
          <span className="h-px w-6 bg-slate-300"></span>
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${step >= 3 ? 'bg-amber-500 text-slate-955' : 'bg-slate-200 text-slate-500'}`}>3</span>
            <span className={step === 3 ? 'text-slate-900 font-black' : ''}>Vehicle Details</span>
          </div>
          <span className="h-px w-6 bg-slate-300"></span>
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${step >= 4 ? 'bg-amber-500 text-slate-955' : 'bg-slate-200 text-slate-500'}`}>4</span>
            <span className={step === 4 ? 'text-slate-900 font-black' : ''}>Upload Credentials</span>
          </div>
          <span className="h-px w-6 bg-slate-300"></span>
          <div className="flex items-center gap-2">
            <span className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${step >= 5 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>5</span>
            <span className={step === 5 ? 'text-emerald-600 font-black' : ''}>Submit Review</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded-r-lg flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-lg overflow-hidden">
          {/* STEP 1: Account setup */}
          {step === 1 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Step 1: Account Credentials</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Provide your primary contact and login details to begin the registration.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Full Name (First and Last Name) *"
                  placeholder="e.g. John Doe"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="bg-white py-2 text-xs font-semibold shadow-sm"
                />
                <Input
                  label="Mobile Number *"
                  placeholder="e.g. +27 82 123 4567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="bg-white py-2 text-xs font-semibold shadow-sm"
                />
                <Input
                  label="Email Address *"
                  placeholder="e.g. john@example.com"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="bg-white py-2 text-xs font-semibold shadow-sm"
                />
                <Input
                  label="Password *"
                  placeholder="Min 6 characters"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="bg-white py-2 text-xs font-semibold shadow-sm"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  onClick={() => {
                    if (!fullName || !phone || !email || !password) {
                      setError('Please fill in all fields.');
                    } else if (password.length < 6) {
                      setError('Password must be at least 6 characters.');
                    } else {
                      setError('');
                      setStep(2);
                    }
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Driver Profile */}
          {step === 2 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Step 2: Driver Profile & Verification</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Upload verified photos and enter your physical address and emergency contacts.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                {/* Visual Image Uploader: Profile Photo */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Profile Photo (Passport size) *</label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'profilePhoto')}
                    className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all relative overflow-hidden"
                  >
                    {uploads.profilePhoto ? (
                      <>
                        <img src={uploads.profilePhoto.preview} alt="Profile" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openCropper('profilePhoto'); }} className="p-1.5 bg-white text-slate-700 rounded-lg hover:text-amber-500"><Crop className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); removeFile('profilePhoto'); }} className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50"><X className="h-4 w-4" /></button>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                        <Upload className="h-6 w-6 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">Drag & Drop or Click to Upload</span>
                        <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'profilePhoto')} accept="image/*" />
                      </label>
                    )}
                  </div>
                </div>

                {/* Visual Image Uploader: Selfie */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Selfie Verification Image *</label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'selfie')}
                    className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition-all relative overflow-hidden"
                  >
                    {uploads.selfie ? (
                      <>
                        <img src={uploads.selfie.preview} alt="Selfie" className="object-cover w-full h-full" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center gap-3 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); openCropper('selfie'); }} className="p-1.5 bg-white text-slate-700 rounded-lg hover:text-amber-500"><Crop className="h-4 w-4" /></button>
                          <button onClick={(e) => { e.stopPropagation(); removeFile('selfie'); }} className="p-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50"><X className="h-4 w-4" /></button>
                        </div>
                      </>
                    ) : (
                      <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                        <Camera className="h-6 w-6 text-slate-400 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">Hold camera, click to capture/upload</span>
                        <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, 'selfie')} accept="image/*" />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Personal Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth *"
                  type="date"
                  value={dob}
                  onChange={e => setDob(e.target.value)}
                  className="bg-white py-2 text-xs font-semibold shadow-sm"
                />
                <div className="relative text-left">
                  <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Gender *</label>
                  <select
                    value={gender}
                    onChange={e => setGender(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 shadow-sm"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>

                <Input
                  label="National ID Number *"
                  placeholder="e.g. 900101XXXXXXXXX"
                  value={nationalId}
                  onChange={e => setNationalId(e.target.value)}
                  className="bg-white py-2 text-xs font-semibold shadow-sm"
                />
                <Input
                  label="Driving License Number *"
                  placeholder="e.g. 12345ABC"
                  value={licenseNumber}
                  onChange={e => setLicenseNumber(e.target.value)}
                  className="bg-white py-2 text-xs font-semibold shadow-sm"
                />
                <Input
                  label="License Expiry Date *"
                  type="date"
                  value={licenseExpiry}
                  onChange={e => setLicenseExpiry(e.target.value)}
                  className="bg-white py-2 text-xs font-semibold shadow-sm"
                />
              </div>

              {/* Emergency Contact */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Emergency Contact Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Contact Person Name *"
                    placeholder="e.g. Jane Doe"
                    value={emergencyName}
                    onChange={e => setEmergencyName(e.target.value)}
                    className="bg-white py-2 text-xs font-semibold shadow-sm"
                  />
                  <Input
                    label="Contact Person Phone *"
                    placeholder="e.g. +27 82 987 6543"
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    className="bg-white py-2 text-xs font-semibold shadow-sm"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="pt-4 border-t border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Residential Base Address</h4>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    className="text-xs text-amber-600 hover:text-amber-700 font-extrabold flex items-center gap-1"
                  >
                    <MapPin className="h-3.5 w-3.5" /> Auto GPS coordinates
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      label="Street Address *"
                      placeholder="e.g. 123 Main Road"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                  </div>
                  <div className="relative text-left" ref={provinceRef}>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Province *</label>
                    <button
                      type="button"
                      onClick={() => setProvinceOpen(!provinceOpen)}
                      className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-xs font-bold text-slate-800 focus:outline-none shadow-sm text-left"
                    >
                      <span>{province}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {provinceOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                        {PROVINCES.map(p => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => { setProvince(p); setProvinceOpen(false); }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-amber-500 hover:text-slate-950 transition-colors"
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Input
                    label="City *"
                    placeholder="e.g. Johannesburg"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="bg-white py-2 text-xs font-semibold shadow-sm"
                  />
                </div>

                {lat !== 0 && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-2">
                    GPS Coordinates Saved: Latitude {lat.toFixed(5)}, Longitude {lng.toFixed(5)}
                  </p>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs uppercase hover:bg-slate-55 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (!uploads.profilePhoto || !uploads.selfie || !dob || !gender || !nationalId || !licenseNumber || !licenseExpiry || !emergencyName || !emergencyPhone || !address || !city) {
                      setError('Please fill in all required fields and upload both photos.');
                    } else {
                      setError('');
                      setStep(3);
                    }
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-955 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Vehicle details */}
          {step === 3 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Step 3: Vehicle Information</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Select your driver affiliation model and register vehicle information.</p>
              </div>

              <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setDriverType('INDEPENDENT')}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${driverType === 'INDEPENDENT' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Independent Driver (Register Own Vehicle)
                </button>
                <button
                  type="button"
                  onClick={() => setDriverType('FLEET')}
                  className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${driverType === 'FLEET' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Fleet Driver (Belong to Company)
                </button>
              </div>

              {driverType === 'FLEET' ? (
                /* Fleet owner association fields */
                <div className="space-y-4">
                  <div className="relative text-left" ref={fleetRef}>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Select Fleet Owner Company *</label>
                    <button
                      type="button"
                      onClick={() => setFleetOpen(!fleetOpen)}
                      className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-xs font-bold text-slate-800 focus:outline-none shadow-sm text-left"
                    >
                      <span>{selectedFleetName || 'Choose from approved companies'}</span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>
                    {fleetOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                        {fleetCompanies.length === 0 ? (
                          <div className="p-3 text-xs text-slate-400 font-bold text-center">No active fleet owners found.</div>
                        ) : (
                          fleetCompanies.map(f => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => { setSelectedFleetId(f.id); setSelectedFleetName(f.name); setFleetOpen(false); }}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-amber-500 hover:text-slate-955 transition-colors"
                            >
                              {f.name}
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold leading-relaxed">
                    ℹ️ You will be linked to this Fleet Owner. Once approved, the fleet owner will assign a vehicle to you from their dashboard.
                  </div>
                </div>
              ) : (
                /* Independent vehicle fields */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative text-left" ref={vehicleRef}>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">Vehicle Type *</label>
                      <button
                        type="button"
                        onClick={() => setVehicleOpen(!vehicleOpen)}
                        className="w-full flex items-center justify-between border border-slate-200 rounded-xl px-4 py-2.5 bg-white text-xs font-bold text-slate-800 focus:outline-none shadow-sm text-left"
                      >
                        <span>{vehicleType}</span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      {vehicleOpen && (
                        <div className="absolute left-0 right-0 z-50 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-40 overflow-y-auto">
                          {VEHICLE_TYPES.map(v => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => { setVehicleType(v); setVehicleOpen(false); }}
                              className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-amber-500 hover:text-slate-955 transition-colors"
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <Input
                      label="Vehicle Registration Number *"
                      placeholder="e.g. ABC 123 GP"
                      value={registrationNumber}
                      onChange={e => setRegistrationNumber(e.target.value)}
                      className="bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                    <Input
                      label="VIN / Chassis Number *"
                      placeholder="17 Character code"
                      value={vin}
                      onChange={e => setVin(e.target.value)}
                      className="bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                    <Input
                      label="Load Capacity (Tons) *"
                      placeholder="e.g. 1.5"
                      type="number"
                      step="0.1"
                      value={capacity}
                      onChange={e => setCapacity(e.target.value)}
                      className="bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                    <Input
                      label="Manufacturer *"
                      placeholder="e.g. Toyota"
                      value={manufacturer}
                      onChange={e => setManufacturer(e.target.value)}
                      className="bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                    <Input
                      label="Model *"
                      placeholder="e.g. Hilux"
                      value={model}
                      onChange={e => setModel(e.target.value)}
                      className="bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                    <Input
                      label="Manufacturing Year *"
                      placeholder="e.g. 2021"
                      type="number"
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      className="bg-white py-2 text-xs font-semibold shadow-sm"
                    />
                  </div>

                  {/* 4 vehicle photos uploads */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Vehicle Photo Verification (Required)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['vehicleFront', 'vehicleBack', 'vehicleLeft', 'vehicleRight'].map((key) => {
                        const name = key.replace('vehicle', '');
                        return (
                          <div key={key} className="space-y-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">{name} View *</span>
                            <div
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, key)}
                              className="h-24 border border-dashed border-slate-300 rounded-xl bg-slate-100 flex items-center justify-center cursor-pointer relative overflow-hidden hover:border-amber-500"
                            >
                              {uploads[key] ? (
                                <>
                                  <img src={uploads[key].preview} alt={name} className="object-cover w-full h-full" />
                                  <button onClick={(e) => { e.stopPropagation(); removeFile(key); }} className="absolute top-1 right-1 p-1 bg-white text-red-500 rounded hover:bg-red-50 shadow-sm"><X className="h-3 w-3" /></button>
                                </>
                              ) : (
                                <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
                                  <Camera className="h-4 w-4 text-slate-400 mb-0.5" />
                                  <span className="text-[9px] font-bold text-slate-500 uppercase">Upload</span>
                                  <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, key)} accept="image/*" />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs uppercase hover:bg-slate-55 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (driverType === 'FLEET' && !selectedFleetId) {
                      setError('Please select your fleet owner company.');
                    } else if (driverType === 'INDEPENDENT' && (!registrationNumber || !vin || !capacity || !manufacturer || !model || !year || !uploads.vehicleFront || !uploads.vehicleBack || !uploads.vehicleLeft || !uploads.vehicleRight)) {
                      setError('Please fill in all vehicle parameters and upload Front, Back, Left, Right photos.');
                    } else {
                      setError('');
                      setStep(4);
                    }
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-955 font-black rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
                >
                  Continue <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Upload Credentials Documents */}
          {step === 4 && (
            <div className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Step 4: Upload Compliance Documents</h2>
                <p className="text-xs text-slate-500 font-semibold mt-1">Please upload clear scans or photos of the documents. Supported formats: JPG, PNG, PDF.</p>
              </div>

              {/* Document fields mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'govtId', label: 'Government ID Document *', sub: 'National ID card or Passport copy' },
                  { key: 'licenseFront', label: 'Driver\'s License Front *', sub: 'Front side showing name and photo' },
                  { key: 'licenseBack', label: 'Driver\'s License Back *', sub: 'Back side showing vehicle classes' },
                  { key: 'policeClearance', label: 'Police Clearance Certificate *', sub: 'Certified clearance (less than 6 months old)' },
                  { key: 'medicalCertificate', label: 'Medical Fitness Certificate *', sub: 'Valid medical endorsement document' },
                  { key: 'proofOfAddress', label: 'Proof of Residential Address *', sub: 'Utility bill, bank statement, or retail statement' },
                  ...(driverType === 'INDEPENDENT' ? [
                    { key: 'vehicleRegistration', label: 'Vehicle Registration Document *', sub: 'Registration details sheet' },
                    { key: 'insuranceDoc', label: 'Vehicle Insurance Policy Document *', sub: 'Valid cover documentation' },
                    { key: 'roadworthyDoc', label: 'Roadworthy Certificate (COF) *', sub: 'Valid fitness disc/paper' }
                  ] : [])
                ].map((doc) => (
                  <div key={doc.key} className="p-4 border border-slate-200 bg-slate-55/50 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-0.5 max-w-[60%]">
                      <h4 className="text-xs font-black text-slate-905">{doc.label}</h4>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">{doc.sub}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {uploads[doc.key] ? (
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">
                          {uploads[doc.key].preview === 'PDF_FILE' ? (
                            <span className="text-[10px] font-bold text-slate-600">PDF Document</span>
                          ) : (
                            <img src={uploads[doc.key].preview} alt="uploaded" className="h-8 w-8 object-cover rounded border border-slate-100" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(doc.key)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="px-4 py-2 border border-amber-500 bg-amber-500/5 text-amber-600 hover:bg-amber-500 hover:text-slate-950 text-[10px] font-black rounded-lg cursor-pointer transition-colors select-none uppercase tracking-wide">
                          Upload File
                          <input type="file" className="hidden" onChange={(e) => handleFileSelect(e, doc.key)} accept="image/*,application/pdf" />
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6 border-t border-slate-100">
                <button
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs uppercase hover:bg-slate-55 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading || !uploads.govtId || !uploads.licenseFront || !uploads.licenseBack || !uploads.policeClearance || !uploads.medicalCertificate || !uploads.proofOfAddress || (driverType === 'INDEPENDENT' && (!uploads.vehicleRegistration || !uploads.insuranceDoc || !uploads.roadworthyDoc))}
                  className={`px-6 py-2.5 text-xs font-black rounded-lg uppercase tracking-wider flex items-center gap-2 transition-all ${
                    (loading || !uploads.govtId || !uploads.licenseFront || !uploads.licenseBack || !uploads.policeClearance || !uploads.medicalCertificate || !uploads.proofOfAddress || (driverType === 'INDEPENDENT' && (!uploads.vehicleRegistration || !uploads.insuranceDoc || !uploads.roadworthyDoc)))
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-amber-500 hover:bg-amber-600 text-slate-955 cursor-pointer shadow-sm'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Submitting Application...
                    </>
                  ) : (
                    <>
                      Submit Application <CheckCircle className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Complete */}
          {step === 5 && (
            <div className="p-8 space-y-6 text-center py-12 animate-fadeIn">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner">
                <Check className="h-10 w-10 stroke-[3]" />
              </div>

              <div className="space-y-3 max-w-md mx-auto">
                <h3 className="font-black text-xl text-slate-950 uppercase tracking-tight">Application Submitted Successfully!</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-semibold">
                  Your application has been submitted successfully. Our team is reviewing your profile.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed font-bold">
                  We verify credentials, licensing, and vehicle discs to ensure compliance. You will receive an email notification once your profile is approved.
                </p>
              </div>

              <div className="pt-6 border-t border-slate-100">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-64 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-955 font-black rounded-xl text-xs tracking-wider uppercase transition-colors shadow-md"
                >
                  Go to Login Panel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reusable slider Canvas-based cropping modal */}
      {croppingFileKey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xl w-full max-w-md">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-sm font-black text-slate-900 uppercase">Crop Photo</h3>
              <button onClick={closeCropper} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div
                className="h-64 bg-slate-900 rounded-xl relative overflow-hidden cursor-move flex items-center justify-center select-none"
                onMouseDown={handleCropMouseDown}
                onMouseMove={handleCropMouseMove}
                onMouseUp={handleCropMouseUp}
                onMouseLeave={handleCropMouseUp}
              >
                <img
                  src={cropSrc}
                  alt="Crop Target"
                  className="pointer-events-none origin-center absolute max-w-none"
                  style={{
                    transform: `translate(${cropOffset.x}px, ${cropOffset.y}px) scale(${cropZoom})`,
                    maxHeight: '100%'
                  }}
                />
                {/* Crop border highlight mask */}
                <div className="absolute inset-0 border-4 border-dashed border-amber-500 pointer-events-none rounded-xl"></div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Zoom: {cropZoom.toFixed(1)}x</label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.1"
                  value={cropZoom}
                  onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeCropper}
                  className="flex-1 py-2.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-55"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-955 rounded-lg text-xs font-black uppercase tracking-wider shadow"
                >
                  Apply Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer light />
    </div>
  );
}
