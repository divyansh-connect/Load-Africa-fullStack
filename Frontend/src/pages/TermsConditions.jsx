import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans flex flex-col justify-between selection:bg-amber-500 selection:text-slate-950">
      <Navbar />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-28 pb-16 text-left flex-1">
        
        {/* Breadcrumb / Label */}
        <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-widest mb-3">
          <Scale className="h-4 w-4" />
          <span>Legal</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-black text-slate-950 tracking-tight mb-2 uppercase">
          Terms and Conditions
        </h1>
        <p className="text-xs text-slate-400 font-bold mb-8">
          Effective Date: 01 June 2026
        </p>

        {/* Legal Sections */}
        <div className="space-y-8 text-sm text-slate-600 leading-relaxed font-normal">
          
          {/* Section 1 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">1. Definitions</h2>
            <p><strong className="text-slate-900">Platform</strong> means LoadAfrica, including its website, mobile application, and related services.</p>
            <p><strong className="text-slate-900">Load Owner</strong> means any person or business posting a transportation requirement on the platform.</p>
            <p><strong className="text-slate-900">Transporter</strong> means any individual, owner-driver, fleet owner, logistics company, or courier accepting transportation requests through the platform.</p>
            <p><strong className="text-slate-900">Driver</strong> means a person operating a vehicle on behalf of a transporter.</p>
            <p><strong className="text-slate-900">User</strong> means any registered person or entity using the platform.</p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">2. Nature of Service</h2>
            <p>LoadAfrica is a technology platform that facilitates connections between Load Owners and Transporters.</p>
            <p>LoadAfrica does not own transport vehicles, is not a logistics carrier, is not responsible for transporting goods, and does not employ drivers unless expressly stated otherwise.</p>
            <p>The transportation agreement exists directly between the Load Owner and the Transporter.</p>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">3. User Registration</h2>
            <p>Users agree to provide accurate information, maintain current contact details, keep login credentials secure, and comply with all applicable laws and regulations.</p>
            <p>LoadAfrica may verify user information before approving an account.</p>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">4. Transporter Requirements</h2>
            <p>Transporters must hold valid licenses and permits, maintain roadworthy vehicles, carry all legally required insurance, comply with South African transport regulations, and ensure drivers are appropriately licensed and qualified.</p>
            <p>LoadAfrica reserves the right to suspend any transporter who fails to meet these requirements.</p>
          </section>

          {/* Section 5 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">5. Load Posting</h2>
            <p>Load Owners are responsible for providing accurate information, including collection address, delivery address, cargo description, cargo weight and dimensions, special handling requirements, and required delivery timeframes.</p>
            <p>LoadAfrica shall not be liable for losses resulting from inaccurate load information.</p>
          </section>

          {/* Section 6 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">6. Pricing and Payments</h2>
            <p>Transport rates are determined by transporters, market demand, distance and vehicle type, and any negotiated pricing between parties.</p>
            <p>LoadAfrica may charge booking fees, service fees, subscription fees, and transaction commissions. All fees are displayed before confirmation where applicable.</p>
          </section>

          {/* Section 7 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">7. Payment Terms</h2>
            <p>Users agree that payments made through the platform may be processed by third-party payment providers. LoadAfrica may deduct commissions and service fees before remitting funds. Disputed payments may be withheld pending investigation.</p>
          </section>

          {/* Section 8 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">8. Cargo Liability</h2>
            <p>The Transporter is solely responsible for cargo during transit, cargo loss, cargo damage, cargo theft, and delays caused by transporter negligence.</p>
            <p>LoadAfrica is not liable for damaged goods, lost goods, theft of cargo, or delivery failures.</p>
            <p>Load Owners are encouraged to obtain cargo insurance where appropriate.</p>
          </section>

          {/* Section 9 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">9. Prohibited Goods</h2>
            <p>Users may not use the platform to transport illegal substances, stolen goods, dangerous goods without permits, counterfeit products, or hazardous materials requiring special authorization.</p>
            <p>LoadAfrica may immediately terminate accounts involved in prohibited activities.</p>
          </section>

          {/* Section 10 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">10. Insurance</h2>
            <p>Transporters are encouraged and may be required to maintain public liability insurance, goods-in-transit insurance, vehicle insurance, and employer liability insurance where applicable.</p>
            <p>LoadAfrica does not provide insurance coverage unless expressly stated.</p>
          </section>

          {/* Section 11 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">11. Ratings and Reviews</h2>
            <p>Users may rate and review one another. LoadAfrica reserves the right to remove false reviews, suspend abusive users, and investigate fraudulent ratings.</p>
          </section>

          {/* Section 12 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">12. Cancellation Policy</h2>
            <p>Load Owners: Cancellation fees may apply where a transporter has already accepted a booking.</p>
            <p>Transporters: Repeated cancellations may result in reduced platform visibility, account suspension, or account termination.</p>
          </section>

          {/* Section 13 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">13. Limitation of Liability</h2>
            <p>To the fullest extent permitted by law, LoadAfrica shall not be liable for indirect damages, loss of profits, business interruption, cargo damage, cargo theft, delayed deliveries, driver conduct, or vehicle breakdowns.</p>
            <p>The maximum liability of LoadAfrica shall not exceed the service fees paid to LoadAfrica for the specific transaction.</p>
          </section>

          {/* Section 14 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">14. Indemnity</h2>
            <p>Users agree to indemnify and hold harmless LoadAfrica, its directors, employees, contractors, and affiliates against claims arising from breach of these Terms, violation of laws, negligence, or misrepresentation.</p>
          </section>

          {/* Section 15 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">15. Suspension and Termination</h2>
            <p>LoadAfrica may suspend or terminate accounts for fraud, non-payment, false information, criminal activity, abuse of the platform, or violation of these Terms.</p>
          </section>

          {/* Section 16 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">16. Privacy and POPIA Compliance</h2>
            <p>LoadAfrica processes personal information in accordance with the Protection of Personal Information Act (POPIA) of South Africa. Users consent to the collection, storage, and processing of information necessary to operate the platform.</p>
          </section>

          {/* Section 17 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">17. Dispute Resolution</h2>
            <p>Parties agree to first attempt amicable resolution. Where disputes cannot be resolved, the matter shall be referred to mediation. Failing mediation, disputes shall be subject to the jurisdiction of South African courts.</p>
          </section>

          {/* Section 18 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">18. Force Majeure</h2>
            <p>Neither party shall be liable for delays or failures caused by natural disasters, riots, strikes, government actions, civil unrest, power failures, or telecommunications failures.</p>
          </section>

          {/* Section 19 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">19. Amendments</h2>
            <p>LoadAfrica may update these Terms and Conditions at any time. Continued use of the platform constitutes acceptance of the updated Terms.</p>
          </section>

          {/* Section 20 */}
          <section className="space-y-2">
            <h2 className="text-base font-black text-slate-900">20. Contact Information</h2>
            <p>LoadAfrica (Pty) Ltd</p>
            <p>Email: support@loadafrica.app</p>
            <p>WhatsApp: 063 931 6677</p>
          </section>

        </div>

        {/* Bottom Callout Info Card */}
        <div className="mt-12 p-6 bg-slate-50 border border-slate-200/80 rounded-2xl text-center">
          <p className="text-xs font-bold text-slate-700">
            By using LoadAfrica, you acknowledge that you have read, understood, and agreed to these Terms and Conditions.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}
