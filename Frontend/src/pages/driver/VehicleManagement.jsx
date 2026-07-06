import React, { useState, useEffect } from 'react';
import { Truck, Scale, ShieldCheck, Compass, Save, CheckCircle2, FileText, Upload } from 'lucide-react';
import { getMockData, saveMockData } from '../../data/mockData';
import { Button, Input, Select, Card } from '../../components/ui';

export default function VehicleManagement() {
  const [driver, setDriver] = useState(null);
  const [licensePlate, setLicensePlate] = useState('');
  const [truckModel, setTruckModel] = useState('');
  const [capacity, setCapacity] = useState('20 Tons');
  const [truckType, setTruckType] = useState('Flatbed Truck');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const drivers = getMockData('drivers') || [];
    const me = drivers[0];
    if (me) {
      setDriver(me);
      const vehicles = getMockData('vehicles') || [];
      const myVehicle = vehicles.find(v => v.id === me.vehicleId);
      if (myVehicle) {
        setLicensePlate(myVehicle.numberPlate);
        setTruckModel(myVehicle.model);
        setCapacity(myVehicle.capacity);
        setTruckType(myVehicle.type);
      }
    }
  }, []);

  const handleUpdate = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(true);

      const vehicles = getMockData('vehicles') || [];
      const vehicleIdx = vehicles.findIndex(v => v.id === driver.vehicleId);
      if (vehicleIdx > -1) {
        vehicles[vehicleIdx] = {
          ...vehicles[vehicleIdx],
          numberPlate: licensePlate,
          model: truckModel,
          capacity: capacity,
          type: truckType
        };
        saveMockData('vehicles', vehicles);
      }
      
      setTimeout(() => setSuccess(false), 2000);
    }, 1200);
  };

  if (!driver) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Vehicle Management</h2>
        <p className="text-xs text-slate-400">Review your registered heavy goods vehicle details and CDL licensing states.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Truck Registry Profile</h3>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input label="Truck Model" placeholder="e.g. Scania R500" value={truckModel} onChange={e => setTruckModel(e.target.value)} required />
                <Input label="Chassis License Plate" placeholder="e.g. CA 123-456" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} required />
                <Input label="Payload Capacity (Tons)" placeholder="e.g. 34" value={capacity} onChange={e => setCapacity(e.target.value)} icon={Scale} required />
                <Select label="Truck Category" value={truckType} onChange={e => setTruckType(e.target.value)}>
                  <option>Flatbed Truck</option>
                  <option>Tipper Truck</option>
                  <option>Box Truck</option>
                  <option>Tanker</option>
                  <option>Trailer</option>
                </Select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : success ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Vehicle details saved
                    </>
                  ) : (
                    <>Save Specifications</>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right 1 Col: documents verification checks */}
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <h3 className="font-bold text-slate-850 text-sm">Regulatory Uploads</h3>
            
            <div className="space-y-4 text-xs">
              <div className="border rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Roadworthiness Certificate</span>
                </div>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Uploaded</span>
              </div>
              
              <div className="border rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>Cargo Carriage Insurance</span>
                </div>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold uppercase">Active</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

    </div>
  );
}
