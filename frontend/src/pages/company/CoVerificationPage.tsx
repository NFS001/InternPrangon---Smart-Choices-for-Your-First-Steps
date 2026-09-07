import { useState, useEffect } from 'react';
import type { Navigate } from '../../data/index';
import type { VerificationStatus } from '../../data/index';
import { getMyCompanyProfile, submitCompanyProfile, getSavedUser } from '../../api/client';

export default function CoVerificationPage({ navigate }: { navigate: Navigate }) {
  const user = getSavedUser();
  const [companyName, setCompanyName] = useState(user?.name || 'Your Company');
  const [status, setStatus] = useState<VerificationStatus>('pending');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    getMyCompanyProfile()
      .then((res) => {
        if (res.profile) {
          setCompanyName(res.profile.companyName || user?.name || 'Your Company');
          const st = (res.profile.verificationStatus || 'Pending').toLowerCase() as VerificationStatus;
          setStatus(st);
        }
      })
      .catch(() => {});
  }, [user?.name]);

  // Step 1 form state
  const [regNumber, setRegNumber] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [website, setWebsite] = useState('');

  // Step 2 upload simulation
  const [tradeLicense, setTradeLicense] = useState(false);
  const [regCert, setRegCert] = useState(false);
  const [nid, setNid] = useState(false);

  const bannerClass =
    status === 'approved'
      ? 'bg-success-50 border-green-300 text-success-700'
      : 'bg-amber-50 border-amber-300 text-amber-800';

  const bannerText =
    status === 'approved'
      ? 'Your company is verified. Internship posting is fully unlocked.'
      : 'Internship posting is available only after verification.';

  const steps = ['Company Info', 'Upload Documents', 'Submit'];

  return (
    <div className="min-h-screen bg-neutral-50 px-6 py-10">
      {/* Test controls */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <span className="text-xs text-neutral-400 self-center mr-1">Test status:</span>
        {(['approved', 'pending', 'rejected', 'unverified'] as VerificationStatus[]).map((s) => (
          <button
            key={s}
            onClick={() => { setStatus(s); setStep(1); }}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              status === s
                ? 'border-violet-600 text-brand-700 bg-brand-50'
                : 'border-neutral-300 text-neutral-500 hover:border-neutral-400'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Notice banner */}
      <div className={`border rounded-xl px-5 py-3 mb-8 text-sm font-medium ${bannerClass}`}>
        {bannerText}
      </div>

      {/* ── APPROVED ── */}
      {status === 'approved' && (
        <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="flex justify-center mb-5">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#dcfce7" />
              <path d="M14 25l7 7 13-14" stroke="#16a34a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold italic text-success-700 mb-3">{companyName} is verified</h1>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Your company identity has been verified by the InternPrangon team. You can now post internships
            and your profile displays the verified badge.
          </p>
          <div className="bg-success-50 border border-success-100 rounded-xl p-5 text-left text-sm space-y-2 mb-8">
            <div className="flex justify-between">
              <span className="text-neutral-500">Date verified</span>
              <span className="font-medium text-neutral-800">Jan 10, 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Verified by</span>
              <span className="font-medium text-neutral-800">InternPrangon Review Team</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Documents submitted</span>
              <span className="font-medium text-neutral-800">3</span>
            </div>
          </div>
          <button
            onClick={() => navigate('co-dashboard')}
            className="bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
          >
            Back to dashboard
          </button>
          <p className="text-xs text-neutral-400 mt-6">
            Something incorrect?{' '}
            <a href="mailto:support@internprangon.com" className="text-brand-600 hover:underline">
              Contact support@internprangon.com
            </a>
          </p>
        </div>
      )}

      {/* ── PENDING ── */}
      {status === 'pending' && (
        <div className="max-w-2xl mx-auto bg-white border border-neutral-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="flex justify-center mb-5">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="#fef3c7" />
              <circle cx="24" cy="24" r="10" stroke="#d97706" strokeWidth="2.5" fill="none" />
              <path d="M24 18v6l4 2" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold italic text-amber-700 mb-3">Verification under review</h1>
          <p className="text-neutral-600 mb-8 leading-relaxed">
            Your documents have been submitted and are being reviewed by our team.
            This usually takes 2–3 business days.
          </p>

          {/* Progress timeline */}
          <div className="flex items-center justify-center gap-0 mb-8">
            {/* Submitted */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-success-500 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l4 4 6-7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs font-medium text-success-700 mt-1">Submitted</span>
            </div>
            <div className="w-16 h-0.5 bg-amber-400 mb-5" />
            {/* Under Review */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center animate-pulse">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="5" stroke="white" strokeWidth="2" fill="none" />
                  <path d="M8 5v3l2 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-xs font-medium text-amber-700 mt-1">Under Review</span>
            </div>
            <div className="w-16 h-0.5 bg-neutral-200 mb-5" />
            {/* Decision */}
            <div className="flex flex-col items-center">
              <div className="w-9 h-9 rounded-full border-2 border-neutral-300 bg-white flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-neutral-300" />
              </div>
              <span className="text-xs text-neutral-400 mt-1">Decision</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 mb-8">
            <span className="font-medium">Submitted:</span> Jan 14, 2025
          </div>
          <p className="text-sm text-neutral-500 mb-6">You will receive an email when a decision is made.</p>
          <button
            onClick={() => navigate('co-dashboard')}
            className="bg-brand-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
          >
            Back to dashboard
          </button>
        </div>
      )}

      {/* ── REJECTED ── */}
      {status === 'rejected' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-neutral-200 rounded-2xl p-10 shadow-sm mb-6">
            <div className="flex justify-center mb-5">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#fee2e2" />
                <path d="M16 16l16 16M32 16L16 32" stroke="#dc2626" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold italic text-danger-700 mb-3 text-center">Verification unsuccessful</h1>
            <p className="text-neutral-600 mb-6 text-center leading-relaxed">
              Your verification submission was not approved. Please review the feedback below and resubmit.
            </p>
            <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 text-sm text-danger-700 mb-2">
              <span className="font-semibold block mb-1">Reviewer feedback:</span>
              "The trade license document submitted was not legible. Please resubmit a clearer scan."
            </div>
          </div>

          {/* Resubmit form — same as unverified */}
          <ResubmitForm
            companyName={companyName}
            step={step}
            setStep={setStep}
            regNumber={regNumber} setRegNumber={setRegNumber}
            industry={industry} setIndustry={setIndustry}
            contactName={contactName} setContactName={setContactName}
            contactEmail={contactEmail} setContactEmail={setContactEmail}
            website={website} setWebsite={setWebsite}
            tradeLicense={tradeLicense} setTradeLicense={setTradeLicense}
            regCert={regCert} setRegCert={setRegCert}
            nid={nid} setNid={setNid}
            onSubmit={async () => {
              try {
                await submitCompanyProfile({
                  companyName,
                  industry: industry || 'Software & Technology',
                  website: website || '',
                  description: 'Enterprise partner in Bangladesh.',
                  verificationDocument: 'trade_license.pdf',
                });
              } catch {}
              setStatus('pending');
            }}
            submitLabel="Resubmit for verification"
          />
        </div>
      )}

      {/* ── UNVERIFIED ── */}
      {status === 'unverified' && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold italic text-brand-700 mb-1">Company Verification</h1>
            <p className="text-neutral-500 text-sm">Complete the steps below to get your company verified.</p>
          </div>
          <ResubmitForm
            companyName={companyName}
            step={step}
            setStep={setStep}
            regNumber={regNumber} setRegNumber={setRegNumber}
            industry={industry} setIndustry={setIndustry}
            contactName={contactName} setContactName={setContactName}
            contactEmail={contactEmail} setContactEmail={setContactEmail}
            website={website} setWebsite={setWebsite}
            tradeLicense={tradeLicense} setTradeLicense={setTradeLicense}
            regCert={regCert} setRegCert={setRegCert}
            nid={nid} setNid={setNid}
            onSubmit={async () => {
              try {
                await submitCompanyProfile({
                  companyName,
                  industry: industry || 'Software & Technology',
                  website: website || '',
                  description: 'Enterprise partner in Bangladesh.',
                  verificationDocument: 'trade_license.pdf',
                });
              } catch {}
              setStatus('pending');
            }}
            submitLabel="Submit for verification"
          />
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Shared multi-step form used by unverified + rejected states   */
/* ────────────────────────────────────────────────────────────── */
interface ResubmitFormProps {
  companyName: string;
  step: 1 | 2 | 3;
  setStep: (s: 1 | 2 | 3) => void;
  regNumber: string; setRegNumber: (v: string) => void;
  industry: string; setIndustry: (v: string) => void;
  contactName: string; setContactName: (v: string) => void;
  contactEmail: string; setContactEmail: (v: string) => void;
  website: string; setWebsite: (v: string) => void;
  tradeLicense: boolean; setTradeLicense: (v: boolean) => void;
  regCert: boolean; setRegCert: (v: boolean) => void;
  nid: boolean; setNid: (v: boolean) => void;
  onSubmit: () => void;
  submitLabel: string;
}

function ResubmitForm({
  companyName,
  step, setStep,
  regNumber, setRegNumber,
  industry, setIndustry,
  contactName, setContactName,
  contactEmail, setContactEmail,
  website, setWebsite,
  tradeLicense, setTradeLicense,
  regCert, setRegCert,
  nid, setNid,
  onSubmit,
  submitLabel,
}: ResubmitFormProps) {
  const stepLabels = ['Company Info', 'Upload Documents', 'Review & Submit'];

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Step indicator */}
      <div className="flex border-b border-neutral-100">
        {stepLabels.map((label, i) => {
          const idx = (i + 1) as 1 | 2 | 3;
          const active = step === idx;
          const done = step > idx;
          return (
            <div key={label} className="flex-1 flex flex-col items-center py-4 gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                done ? 'bg-success-500 text-white' : active ? 'bg-brand-600 text-white' : 'bg-neutral-100 text-neutral-400'
              }`}>
                {done ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : idx}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-brand-700' : done ? 'text-success-600' : 'text-neutral-400'}`}>
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="p-8">
        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-semibold text-neutral-800 text-lg mb-4">Company Information</h2>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                readOnly
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm bg-neutral-100 text-neutral-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Registration Number</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="e.g. C-1234/2018"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
              >
                <option value="">Select industry</option>
                <option>Software & Technology</option>
                <option>Finance & Banking</option>
                <option>Healthcare</option>
                <option>Education</option>
                <option>E-Commerce</option>
                <option>Media & Marketing</option>
                <option>Manufacturing</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Contact Person Name</label>
              <input
                type="text"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full name"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Contact Email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hr@yourcompany.com"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Company Website</label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors mt-2"
            >
              Next: Upload Documents
            </button>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-neutral-800 text-lg mb-4">Upload Documents</h2>

            {[
              { label: 'Trade License', uploaded: tradeLicense, toggle: () => setTradeLicense(!tradeLicense), filename: 'trade_license.pdf' },
              { label: 'Company Registration Certificate', uploaded: regCert, toggle: () => setRegCert(!regCert), filename: 'registration_cert.pdf' },
              { label: 'Contact Person NID / Passport', uploaded: nid, toggle: () => setNid(!nid), filename: 'contact_nid.pdf' },
            ].map(({ label, uploaded, toggle, filename }) => (
              <div key={label}>
                <label className="block text-sm font-medium text-neutral-700 mb-2">{label}</label>
                <button
                  type="button"
                  onClick={toggle}
                  className={`w-full border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    uploaded
                      ? 'border-green-400 bg-success-50'
                      : 'border-neutral-300 hover:border-brand-400 hover:bg-brand-50'
                  }`}
                >
                  {uploaded ? (
                    <div className="flex items-center justify-center gap-2 text-success-700">
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <circle cx="9" cy="9" r="9" fill="#22c55e" />
                        <path d="M5 9l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="text-sm font-medium">{filename}</span>
                    </div>
                  ) : (
                    <>
                      <svg className="mx-auto mb-2 text-neutral-400" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M12 16V8m0 0l-3 3m3-3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <rect x="3" y="3" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                      <p className="text-sm text-neutral-600 font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-neutral-400 mt-1">PDF or image, max 5MB</p>
                    </>
                  )}
                </button>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-neutral-300 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold hover:bg-brand-700 transition-colors"
              >
                Next: Review & Submit
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-neutral-800 text-lg mb-4">Review & Submit</h2>

            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-neutral-500">Company Name</span><span className="font-medium">{companyName}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Registration No.</span><span className="font-medium">{regNumber || '—'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Industry</span><span className="font-medium">{industry || '—'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Contact Person</span><span className="font-medium">{contactName || '—'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Contact Email</span><span className="font-medium">{contactEmail || '—'}</span></div>
              <div className="flex justify-between"><span className="text-neutral-500">Website</span><span className="font-medium">{website || '—'}</span></div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-neutral-700 mb-3">Uploaded documents</h3>
              <ul className="space-y-2">
                {[
                  { label: 'Trade License', uploaded: tradeLicense },
                  { label: 'Company Registration Certificate', uploaded: regCert },
                  { label: 'Contact Person NID / Passport', uploaded: nid },
                ].map(({ label, uploaded }) => (
                  <li key={label} className="flex items-center gap-2 text-sm">
                    {uploaded ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#22c55e" />
                        <path d="M4 8l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="8" fill="#e5e7eb" />
                        <path d="M5 5l6 6M11 5l-6 6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                    <span className={uploaded ? 'text-neutral-800' : 'text-neutral-400'}>{label}</span>
                    {!uploaded && <span className="text-xs text-red-400">(not uploaded)</span>}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-neutral-500 italic">
              By submitting, you agree to our verification terms.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-neutral-300 text-neutral-700 py-3 rounded-xl font-semibold hover:bg-neutral-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={onSubmit}
                className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors"
              >
                {submitLabel}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
