import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowLeft } from 'lucide-react';
import ProgressStepper from '../components/yellow-plant/ProgressStepper';
import Step1ChooseMachine from '../components/yellow-plant/Step1ChooseMachine';
import Step2BookingDetails from '../components/yellow-plant/Step2BookingDetails';
import Step3Quotation from '../components/yellow-plant/Step3Quotation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function YellowPlantBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    startDate: '',
    durationDays: '',
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    province: ''
  });

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden relative selection:bg-amber-500 selection:text-slate-950">
      
      <Navbar />


      {/* Hero Header Area */}
      <div className="relative z-10 w-full overflow-hidden bg-slate-900 text-white pt-12 pb-24 lg:pt-16 lg:pb-32 mt-16">
        <main className="relative z-10 max-w-7xl mx-auto px-6 text-left space-y-6 mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-wider mb-6"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          
          <div className="space-y-4">
            <span className="text-[#f99c00] font-bold text-xs uppercase tracking-wider block">
              YELLOW PLANT HIRE
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight uppercase max-w-4xl tracking-tight">
              BOOK HEAVY CONSTRUCTION EQUIPMENT
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-3xl">
              Book heavy construction equipment at competitive hourly rates. All machines come with qualified operators.
            </p>
            <div className="pt-4">
              <button 
                onClick={() => navigate('/plant/register')} 
                className="inline-block px-6 py-3.5 border border-[#f99c00] text-[#f99c00] hover:bg-[#f99c00] hover:text-slate-950 font-black rounded-lg text-xs tracking-wider transition-colors uppercase"
              >
                LIST YOUR PLANT
              </button>
            </div>
          </div>
        </main>
        
        {/* Decorative Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-[0]">
          <svg className="relative block w-[calc(100%+1.3px)] h-[40px] sm:h-[80px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C49.71,114.73,103.1,119.5,155,116.14,213.1,112.35,268.49,84.45,321.39,56.44Z" fill="#ffffff"></path>
          </svg>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 text-center">

        {/* Booking Card */}
        <div
          className="rounded-2xl border border-slate-200 w-full max-w-[600px] mx-auto flex flex-col relative h-[695px]"
          style={{ backgroundColor: '#ffffff', boxShadow: '0 8px 40px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.06)' }}
        >
          
          {/* Card Header (Fixed at top of card) */}
          <div className="p-4 pb-2 shrink-0 text-left">
            <div className="flex items-center gap-3 mb-2">
              {/* Back Arrow for Step > 1 */}
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)} 
                  className="text-slate-400 hover:text-slate-700 transition-colors mr-1"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
              )}
              <div className="text-[#f99c00]">
                {/* Construction hat / machine icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 22h20"/><path d="M16 2v2"/><path d="M8 2v2"/><path d="M19 12a7 7 0 0 0-14 0h14Z"/><path d="M5 12v10"/><path d="M19 12v10"/>
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-955 uppercase tracking-wider">
                {step === 1 ? 'BOOK YELLOW PLANT' : step === 2 ? 'BOOKING DETAILS' : step === 3 ? 'YOUR QUOTATION' : 'BOOKING CONFIRMED'}
              </h2>
            </div>

            {/* Stepper */}
            {step <= 3 && <ProgressStepper currentStep={step} />}
          </div>

          {/* Non-Scrollable Content Area Wrapper (Scrolling handled inside components) */}
          <div className="px-4 pb-3 flex-1 flex flex-col overflow-hidden text-left">
            {step === 1 && (
              <Step1ChooseMachine 
                selectedMachine={selectedMachine} 
                onSelectMachine={setSelectedMachine} 
                onNext={() => setStep(2)} 
              />
            )}
            
            {step === 2 && (
              <Step2BookingDetails 
                selectedMachine={selectedMachine}
                bookingDetails={bookingDetails}
                setBookingDetails={setBookingDetails}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            
            {step === 3 && (
              <Step3Quotation 
                selectedMachine={selectedMachine}
                bookingDetails={bookingDetails}
                onBack={() => setStep(2)}
                onConfirm={() => setStep(4)}
              />
            )}

            {step === 4 && (
              <div className="animate-in zoom-in duration-300 flex flex-col items-center justify-center text-center p-6 space-y-5 h-full">
                <div className="h-16 w-16 bg-emerald-55 border border-emerald-250 text-emerald-600 rounded-full flex items-center justify-center animate-pulse">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Booking Submitted!</h3>
                  <p className="text-xs text-slate-500 font-bold max-w-sm mt-2 leading-relaxed">
                    Your hire request has been sent to the Yellow Plant owner. They will review compliance requirements and verify dispatch scheduling shortly.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedMachine(null);
                    setBookingDetails({
                      startDate: '',
                      durationDays: '',
                      companyName: '',
                      contactPerson: '',
                      phone: '',
                      email: '',
                      address: '',
                      city: '',
                      province: ''
                    });
                    setStep(1);
                  }}
                  className="px-6 py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-950 font-black rounded-lg text-xs uppercase tracking-widest transition-colors shadow-md"
                >
                  Book Another Machine
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Own construction equipment banner */}
        <div className="bg-white rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.05)] border border-slate-200 p-8 mt-6 mb-6 max-w-[600px] mx-auto space-y-3">
          <h3 className="text-lg font-black text-slate-900">Own construction equipment?</h3>
          <p className="text-xs font-bold text-slate-500 pb-2">List your machine on LoadAfrica and start receiving hire requests.</p>
          <button 
            onClick={() => navigate('/plant/register')}
            className="px-6 py-2.5 bg-[#f99c00] hover:bg-[#e08b00] text-slate-955 font-black rounded text-xs tracking-wider transition-colors uppercase"
          >
            LIST YOUR PLANT
          </button>
        </div>
      </main>
      <Footer light />
    </div>
  );
}
