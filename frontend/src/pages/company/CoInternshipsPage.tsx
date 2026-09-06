import { useState, useEffect } from 'react';
import type { Navigate } from '../../data/index';
import { HR_INTERNSHIPS } from '../../data/index';
import type { HRInternship } from '../../data/index';

type TabType = 'active' | 'draft' | 'expired';

export default function CoInternshipsPage({ navigate }: { navigate: Navigate }) {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [createMode, setCreateMode] = useState(false);
  const [toast, setToast] = useState(false);

  // Create form state
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [type, setType] = useState<'Remote' | 'On-site' | 'Hybrid'>('Remote');
  const [paid, setPaid] = useState(true);
  const [stipend, setStipend] = useState('');
  const [openings, setOpenings] = useState(1);
  const [duration, setDuration] = useState('');
  const [deadline, setDeadline] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [qualifications, setQualifications] = useState('');

  const tabCounts: Record<TabType, number> = {
    active: HR_INTERNSHIPS.filter((i) => i.status === 'active').length,
    draft: HR_INTERNSHIPS.filter((i) => i.status === 'draft').length,
    expired: HR_INTERNSHIPS.filter((i) => i.status === 'expired').length,
  };

  const filtered = HR_INTERNSHIPS.filter((i) => i.status === activeTab);

  function handleAddTag() {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  }

  function handlePublish() {
    setCreateMode(false);
    setToast(true);
  }

  useEffect(() => {
    if (toast) {
      const id = setTimeout(() => setToast(false), 3000);
      return () => clearTimeout(id);
    }
  }, [toast]);

  /* ── CREATE FORM ── */
  if (createMode) {
    return (
      <div className="min-h-screen bg-neutral-50 px-8 py-10">
        {/* Toast */}
        {toast && (
          <div className="fixed top-5 right-5 bg-success-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50 animate-fade-in">
            Internship published successfully! {openings} opening{openings !== 1 ? 's are' : ' is'} now live.
          </div>
        )}

        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setCreateMode(false)}
            className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-brand-700 mb-6 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to listings
          </button>

          <h1 className="text-2xl font-bold italic text-brand-700 mb-8">Create internship</h1>

          <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm space-y-7">
            {/* Title */}
            <FormField label="Internship Title" hint="This is the first thing applicants see.">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend Developer Intern"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </FormField>

            {/* Department */}
            <FormField label="Department" hint="Which team will this intern join?">
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering, Design, Marketing"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </FormField>

            {/* Type */}
            <FormField label="Work type" hint="Where will the intern work?">
              <div className="flex gap-2">
                {(['Remote', 'On-site', 'Hybrid'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      type === t
                        ? 'bg-brand-600 text-white border-violet-600'
                        : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Paid / Unpaid */}
            <FormField label="Compensation" hint="Is this a paid internship?">
              <div className="flex gap-2">
                {[{ label: 'Paid', value: true }, { label: 'Unpaid', value: false }].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setPaid(opt.value)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      paid === opt.value
                        ? 'bg-brand-600 text-white border-violet-600'
                        : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </FormField>

            {/* Stipend — conditional */}
            {paid && (
              <FormField label="Stipend" hint="Monthly stipend amount.">
                <input
                  type="text"
                  value={stipend}
                  onChange={(e) => setStipend(e.target.value)}
                  placeholder="e.g. BDT 15,000/mo"
                  className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </FormField>
            )}

            {/* Openings */}
            <FormField label="Number of openings" hint="How many interns are you hiring?">
              <input
                type="number"
                min={1}
                value={openings}
                onChange={(e) => setOpenings(Number(e.target.value))}
                className="w-32 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </FormField>

            {/* Duration */}
            <FormField label="Duration" hint="How long is the internship?">
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3 months"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </FormField>

            {/* Deadline */}
            <FormField label="Application deadline" hint="When should applicants apply by?">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </FormField>

            {/* Tags */}
            <FormField label="Skills / Tags" hint="Add relevant skills so students can find this internship.">
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="e.g. React, Python..."
                  className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <span key={t} className="flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-medium px-3 py-1 rounded-full">
                      {t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-brand-900 leading-none">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </FormField>

            {/* Description */}
            <FormField label="Description" hint="Describe the role, what interns will work on, and what you're looking for.">
              <textarea
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, what interns will work on, and what you're looking for..."
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </FormField>

            {/* Responsibilities */}
            <FormField label="Responsibilities" hint="List key responsibilities, one per line.">
              <textarea
                rows={4}
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
                placeholder="List key responsibilities, one per line"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </FormField>

            {/* Qualifications */}
            <FormField label="Qualifications" hint="List required qualifications, one per line.">
              <textarea
                rows={4}
                value={qualifications}
                onChange={(e) => setQualifications(e.target.value)}
                placeholder="List required qualifications, one per line"
                className="w-full border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none"
              />
            </FormField>

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setCreateMode(false)}
                className="px-6 py-2.5 border border-neutral-300 text-neutral-600 rounded-xl text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                Save as draft
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="px-8 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-semibold hover:bg-amber-600 transition-colors"
              >
                Publish internship
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── LIST VIEW ── */
  return (
    <div className="min-h-screen bg-neutral-50 px-8 py-10">
      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-success-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium z-50">
          Internship published successfully! {openings} opening{openings !== 1 ? 's are' : ' is'} now live.
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold italic text-brand-700">Internship Listings</h1>
          <p className="text-neutral-500 text-sm mt-1">Manage your active, draft, and expired postings.</p>
        </div>
        <button
          onClick={() => setCreateMode(true)}
          className="bg-amber-500 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-600 transition-colors"
        >
          + Create new internship
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-neutral-100 p-1 rounded-xl w-fit mb-7">
        {(['active', 'draft', 'expired'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            <span className={`ml-1.5 text-xs rounded-full px-1.5 py-0.5 ${
              activeTab === tab ? 'bg-brand-100 text-brand-600' : 'bg-neutral-200 text-neutral-500'
            }`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-12 text-center text-neutral-400">
            No {activeTab} internships yet.
          </div>
        )}
        {filtered.map((internship) => (
          <InternshipCard
            key={internship.id}
            internship={internship}
            navigate={navigate}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Internship row card ── */
function InternshipCard({ internship, navigate }: { internship: HRInternship; navigate: Navigate }) {
  const { id, title, status, type, paid, deadline, daysLeft, applicants, shortlisted, interviewing, stipend, tags } = internship;

  const statusPill: Record<typeof status, string> = {
    active: 'bg-success-100 text-success-700',
    draft: 'bg-amber-100 text-amber-700',
    expired: 'bg-neutral-100 text-neutral-500',
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h2 className="font-bold text-neutral-900 text-base">{title}</h2>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${statusPill[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {daysLeft > 0 && daysLeft <= 3 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-danger-100 text-danger-600">
                Closing soon!
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3 flex-wrap">
            <span>{type}</span>
            <span>&middot;</span>
            <span className={paid ? 'text-success-600 font-medium' : 'text-neutral-400'}>
              {paid ? `Paid${stipend ? ` · ${stipend}` : ''}` : 'Unpaid'}
            </span>
            <span>&middot;</span>
            <span>Deadline: {deadline}</span>
          </div>

          <div className="flex gap-4 text-xs text-neutral-500 mb-3">
            <span><span className="font-semibold text-neutral-800">{applicants}</span> applicants</span>
            <span><span className="font-semibold text-neutral-800">{shortlisted}</span> shortlisted</span>
            <span><span className="font-semibold text-neutral-800">{interviewing}</span> interviewing</span>
          </div>

          {tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {tags.map((tag) => (
                <span key={tag} className="bg-brand-50 text-brand-600 text-xs px-2.5 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {status === 'active' && (
            <>
              <button
                onClick={() => navigate('co-applicants', { internshipId: id })}
                className="px-4 py-1.5 bg-brand-600 text-white text-xs font-semibold rounded-lg hover:bg-brand-700 transition-colors"
              >
                View applicants
              </button>
              <button className="px-4 py-1.5 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                Edit
              </button>
              <button className="px-4 py-1.5 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 transition-colors">
                Close
              </button>
            </>
          )}
          {status === 'draft' && (
            <>
              <button className="px-4 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg hover:bg-amber-600 transition-colors">
                Publish
              </button>
              <button className="px-4 py-1.5 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                Edit
              </button>
              <button className="px-4 py-1.5 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-danger-50 hover:text-danger-600 hover:border-danger-200 transition-colors">
                Delete
              </button>
            </>
          )}
          {status === 'expired' && (
            <>
              <button className="px-4 py-1.5 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                Repost
              </button>
              <button className="px-4 py-1.5 border border-neutral-200 text-neutral-600 text-xs font-medium rounded-lg hover:bg-neutral-50 transition-colors">
                View archive
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reusable form field wrapper ── */
function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-neutral-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-neutral-400 mt-1">{hint}</p>}
    </div>
  );
}
