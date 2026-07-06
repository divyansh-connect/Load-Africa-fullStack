import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Scale, DollarSign, Calendar, Truck, ArrowRight, ArrowLeft } from 'lucide-react';
import { createLoad } from '../../data/mockData';
import { Button, Input, Select, Card, VehicleCard, GooglePlacesInput } from '../../components/ui';

const VEHICLES_LIST = [
  { id: 'bakkie', name: 'Bakkie', capacity: '1 - 1.5 Tons', multiplier: 0.5, desc: 'Light city transits, express parcel deliveries, furniture removals', img: 'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=300&auto=format&fit=crop&q=80' },
  { id: 'box', name: '4-Ton & 8-Ton closed trucks', capacity: '4 - 8 Tons', multiplier: 0.8, desc: 'Closed cargo transportation, office relocation, commercial logistics', img: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=300&auto=format&fit=crop&q=80' },
  { id: 'tipper', name: 'Side Tipper', capacity: '20 - 30 Tons', multiplier: 1.2, desc: 'Bulk sand supply, rubble clearing, aggregates, mining gravel', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=300&auto=format&fit=crop&q=80' },
  { id: 'tanker', name: 'Tanker', capacity: '35,000 Liters', multiplier: 1.3, desc: 'Bulk liquid logistics, chemical carriage, industrial fuel', img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=300&auto=format&fit=crop&q=80' },
  { id: 'yellow_plant', name: 'Yellow Plant (TLB, Excavator)', capacity: 'Heavy Plant', multiplier: 1.5, desc: 'Construction site plant machinery placement, excavators, TLBs', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=300&auto=format&fit=crop&q=80' }
];

export default function CreateBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Building Materials');
  const [weight, setWeight] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('bakkie');
  const [loading, setLoading] = useState(false);

  const calculateTotalRate = () => {
    const v = VEHICLES_LIST.find(x => x.id === selectedVehicle);
    const m = v ? v.multiplier : 1.0;
    return Math.round(Number(budget || 500) * m);
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!title || !weight || !pickup || !dropoff || !budget) return;
    setStep(2);
  };

  const handleCreate = () => {
    setLoading(true);
    const finalRate = calculateTotalRate();
    const newLoad = {
      title,
      category,
      weight: `${weight} Tons`,
      pickup,
      dropoff,
      budget: finalRate,
      customerName: 'Patrice Motsepe',
      customerId: 'usr-1',
      vehicleType: VEHICLES_LIST.find(v => v.id === selectedVehicle).name
    };

    setTimeout(() => {
      const created = createLoad(newLoad);
      setLoading(false);
      navigate(`/customer/booking-details?id=${created.id}`);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-fadeIn">
      
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Book A Load Cargo</h2>
        <p className="text-xs text-slate-400">Post details of your freight cargo to match transiting drivers.</p>
      </div>

      {step === 1 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">1. Cargo & Route Details</h3>
          
          <form onSubmit={handleNextStep} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Cargo Name" placeholder="e.g. 500 Bags of Cement" value={title} onChange={e => setTitle(e.target.value)} required />
              <Select label="Category" value={category} onChange={e => setCategory(e.target.value)}>
                <option>Building Materials</option>
                <option>Heavy Equipment</option>
                <option>Food & Beverage</option>
                <option>Agriculture</option>
                <option>Consumer Goods</option>
              </Select>
              <Input label="Cargo Weight (Tons)" type="number" placeholder="e.g. 25" value={weight} onChange={e => setWeight(e.target.value)} icon={Scale} required />
              <Input label="Base Budget (R)" type="number" placeholder="e.g. 12000" value={budget} onChange={e => setBudget(e.target.value)} icon={DollarSign} required />
              <div className="md:col-span-2">
                <GooglePlacesInput 
                  label="Pickup Location Address" 
                  placeholder="Search pickup point" 
                  value={pickup} 
                  onChange={e => setPickup(e.target.value)} 
                  onPlaceSelect={place => setPickup(place.address)} 
                  icon={MapPin} 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <GooglePlacesInput 
                  label="Delivery Location Address" 
                  placeholder="Search destination" 
                  value={dropoff} 
                  onChange={e => setDropoff(e.target.value)} 
                  onPlaceSelect={place => setDropoff(place.address)} 
                  icon={MapPin} 
                  required 
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit">
                Select Vehicle Category
                <ArrowRight className="h-4.5 w-4.5 ml-2" />
              </Button>
            </div>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card className="p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-slate-800">2. Select Vehicle Category</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VEHICLES_LIST.map((vh) => (
              <VehicleCard 
                key={vh.id}
                img={vh.img}
                name={vh.name}
                capacity={vh.capacity}
                desc={vh.desc}
                rate={Math.round(Number(budget) * vh.multiplier)}
                selected={selectedVehicle === vh.id}
                onClick={() => setSelectedVehicle(vh.id)}
              />
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button type="button" onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Cargo Details
            </button>
            <Button onClick={handleCreate} disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Confirm & Dispatch Booking</>
              )}
            </Button>
          </div>
        </Card>
      )}

    </div>
  );
}
