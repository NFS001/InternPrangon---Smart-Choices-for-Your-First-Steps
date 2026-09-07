import React, { useState, useEffect } from 'react'
import type { Navigate } from '../../data/index'
import type { AdminCompany, AdminVerifStatus } from '../../data/index'
import { getAllCompaniesAdmin, getCompanyDirectory, verifyCompanyAdmin, deleteCompanyAdmin, addCompanyAdmin } from '../../api/client'

interface Props {
  navigate: Navigate
  companyId?: number | string
}

type QueueTab = 'pending' | 'all' | 'approved' | 'rejected'

type LiveAdminCompany = AdminCompany & { mongoId?: string }

const saveVerificationOverride = (
  company: { id: number | string; mongoId?: string; name: string },
  status: AdminVerifStatus
) => {
  try {
    const raw = localStorage.getItem('internprangon_company_verifications');
    const overrides = raw ? JSON.parse(raw) : {};
    if (company.mongoId) overrides[String(company.mongoId)] = status;
    overrides[String(company.id)] = status;
    if (company.name) overrides[company.name.toLowerCase()] = status;
    localStorage.setItem('internprangon_company_verifications', JSON.stringify(overrides));
    window.dispatchEvent(new Event('internprangon_verifications_updated'));
  } catch {}
};

export default function AdminVerificationsPage({ navigate, companyId }: Props) {
  const [companies, setCompanies] = useState<LiveAdminCompany[]>([]);
  const [selectedId, setSelectedId] = useState<number | string | null>(companyId ?? null)
  const [loading, setLoading] = useState(true)
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [queueTab, setQueueTab] = useState<QueueTab>('pending')
  const [deleteInput, setDeleteInput] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false)

  // Add Company Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addName, setAddName] = useState('')
  const [addIndustry, setAddIndustry] = useState('Technology')
  const [addWebsite, setAddWebsite] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addStatus, setAddStatus] = useState<'Pending' | 'Approved'>('Pending')
  const [addLoading, setAddLoading] = useState(false)

  const fetchLiveCompanies = async () => {
    try {
      setLoading(true);
      const overrides: Record<string, string> = JSON.parse(
        localStorage.getItem('internprangon_company_verifications') || '{}'
      );
      let rawList: any[] = [];
      try {
        const res = await getAllCompaniesAdmin();
        rawList = res.companies || [];
      } catch {
        const dir = await getCompanyDirectory({ limit: 100 }).catch(() => ({ companies: [] }));
        rawList = dir.companies || [];
      }

      const mapped: LiveAdminCompany[] = rawList.map((c, idx) => {
        const initials = c.companyName ? c.companyName.trim().slice(0, 2).toUpperCase() : 'CO';
        const override =
          overrides[c._id] ||
          overrides[String(idx + 1)] ||
          overrides[(c.companyName || '').toLowerCase()];
        const baseStatus: AdminVerifStatus =
          c.verificationStatus === 'Approved'
            ? 'approved'
            : c.verificationStatus === 'Rejected'
            ? 'rejected'
            : 'pending';
        const status = (override as AdminVerifStatus) || baseStatus;
        return {
          id: idx + 1,
          mongoId: c._id,
          name: c.companyName || 'Company',
          logo: initials,
          logoBg: '#eff6ff',
          logoColor: '#2563eb',
          slug: (c.companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '-'),
          email: (c.user && typeof c.user === 'object' && 'email' in c.user && (c.user as { email?: string }).email)
            ? (c.user as { email: string }).email
            : `${(c.companyName || 'company').toLowerCase().replace(/[^a-z0-9]/g, '')}@example.com`,
          website: c.website || 'https://example.com',
          industry: c.industry || 'Technology',
          size: '51–200',
          location: 'Dhaka, Bangladesh',
          registrationNo: `REG-${(c._id || '1000').slice(-6).toUpperCase()}`,
          internshipCount: c.internshipsCount ?? 2,
          reviewCount: c.reviewCount ?? 0,
          documents: [c.verificationDocument || 'trade_license.pdf', 'registration_cert.pdf'],
          verificationStatus: status,
          submittedDate: new Date(c.createdAt || Date.now()).toLocaleDateString(),
          submittedAt: new Date(c.createdAt || Date.now()).toLocaleDateString(),
          documentUrl: '#',
          documentName: c.verificationDocument || 'trade_license.pdf',
          verificationDocName: c.verificationDocument || 'trade_license.pdf',
          description: c.description || 'Verified enterprise partner in Bangladesh.',
          primaryContact: {
            name: (c.user && typeof c.user === 'object' && 'name' in c.user && (c.user as { name?: string }).name)
              ? (c.user as { name: string }).name
              : 'HR Team',
            role: 'Recruiter',
            email: 'hr@example.com',
            phone: '+880 1700-000000',
          },
        };
      });
      setCompanies(mapped);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveCompanies();
    const handleSync = () => fetchLiveCompanies();
    window.addEventListener('storage', handleSync);
    window.addEventListener('internprangon_verifications_updated', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('internprangon_verifications_updated', handleSync);
    };
  }, []);

  useEffect(() => {
    if (companyId !== undefined && companyId !== null) {
      setSelectedId(companyId);
    }
  }, [companyId]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 2500)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg)
  }

  const updateCompany = (id: number | string, patch: Partial<LiveAdminCompany>) => {
    setCompanies((prev) => prev.map((c) => (c.id === id || c.mongoId === String(id) ? { ...c, ...patch } : c)))
  }

  const selected = companies.find((c) => String(c.id) === String(selectedId) || (c.mongoId && c.mongoId === String(selectedId))) ?? null

  const pendingCount = companies.filter((c) => c.verificationStatus === 'pending').length
  const approvedCount = companies.filter((c) => c.verificationStatus === 'approved').length
  const rejectedCount = companies.filter((c) => c.verificationStatus === 'rejected').length

  const queueFiltered = companies.filter((c) => {
    if (queueTab === 'all') return true
    return c.verificationStatus === queueTab
  })

  const statusPillClass = (status: AdminVerifStatus) => {
    if (status === 'pending') return 'bg-amber-50 text-amber-700 border border-amber-200'
    if (status === 'approved') return 'bg-success-50 text-success-700 border border-success-200'
    return 'bg-danger-50 text-danger-600 border border-danger-200'
  }

  const statusLabel = (status: AdminVerifStatus) =>
    status === 'pending' ? 'Pending' : status === 'approved' ? 'Verified' : 'Rejected'

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim()) return
    setAddLoading(true)
    try {
      await addCompanyAdmin({
        companyName: addName.trim(),
        industry: addIndustry,
        website: addWebsite.trim() || 'https://example.com',
        description: addDescription.trim() || 'Verified enterprise partner in Bangladesh.',
        verificationStatus: addStatus,
        verificationDocument: 'trade_license.pdf',
      })
      showSuccess(`Company "${addName.trim()}" added successfully!`)
      setShowAddModal(false)
      setAddName('')
      setAddWebsite('')
      setAddDescription('')
      window.dispatchEvent(new Event('internprangon_verifications_updated'))
      fetchLiveCompanies()
    } catch {
      showSuccess('Failed to add company.')
    } finally {
      setAddLoading(false)
    }
  }

  const handleApprove = async () => {
    if (!selected) return
    const name = selected.name
    updateCompany(selected.id, { verificationStatus: 'approved' })
    saveVerificationOverride(selected, 'approved')
    if (selected.mongoId) {
      await verifyCompanyAdmin(selected.mongoId, 'Approved').catch(() => {})
    }
    showSuccess(`${name} has been verified.`)
    setSelectedId(null)
  }

  const handleRejectConfirm = async () => {
    if (!selected) return
    const name = selected.name
    updateCompany(selected.id, { verificationStatus: 'rejected', rejectionReason: rejectReason })
    saveVerificationOverride(selected, 'rejected')
    if (selected.mongoId) {
      await verifyCompanyAdmin(selected.mongoId, 'Rejected').catch(() => {})
    }
    showSuccess(`${name} verification rejected.`)
    setShowRejectForm(false)
    setRejectReason('')
    setSelectedId(null)
  }

  const handleReevaluate = async () => {
    if (!selected) return
    updateCompany(selected.id, { verificationStatus: 'pending', rejectionReason: undefined })
    saveVerificationOverride(selected, 'pending')
    setSelectedId(null)
  }

  const handleRevokeConfirm = async () => {
    if (!selected) return
    updateCompany(selected.id, { verificationStatus: 'pending' })
    saveVerificationOverride(selected, 'pending')
    if (selected.mongoId) {
      await verifyCompanyAdmin(selected.mongoId, 'Rejected').catch(() => {})
    }
    setShowRevokeConfirm(false)
    showSuccess(`${selected.name} verification revoked.`)
    setSelectedId(null)
  }

  const handleDelete = async () => {
    if (!selected || deleteInput !== 'DELETE') return
    const targetMongoId = selected.mongoId
    const name = selected.name
    setCompanies((prev) => prev.filter((c) => c.id !== selected.id))
    saveVerificationOverride(selected, 'rejected')
    if (targetMongoId) {
      await deleteCompanyAdmin(targetMongoId).catch(() => {})
    }
    showSuccess(`${name} has been deleted.`)
    setSelectedId(null)
    setDeleteInput('')
    setShowDeleteConfirm(false)
  }

  const PdfIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-danger-600 flex-shrink-0">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )

  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )

  /* ── DETAIL VIEW ── */
  if (selectedId !== null && selected) {
    return (
      <div className="min-h-screen bg-neutral-50 pb-12">
        {/* Success banner */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
            {successMessage}
          </div>
        )}

        <div className="px-6 pt-8 pb-4">
          <button
            onClick={() => { setSelectedId(null); setShowRejectForm(false); setShowDeleteConfirm(false); setShowRevokeConfirm(false) }}
            className="text-sm text-brand-600 font-medium hover:underline mb-4 inline-block"
          >
            ← Verification Queue
          </button>

          {/* Header card */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                style={{ backgroundColor: selected.logoBg || '#eff6ff', color: selected.logoColor || '#2563eb' }}
              >
                {selected.logo || selected.name?.slice(0, 2).toUpperCase() || 'CO'}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-bold text-neutral-900">{selected.name}</h2>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${statusPillClass(selected.verificationStatus)}`}>
                    {statusLabel(selected.verificationStatus)}
                  </span>
                </div>
                <p className="text-sm text-neutral-500 mt-0.5">{selected.website || 'https://example.com'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Registration No.', value: selected.registrationNo || 'REG-1001' },
                { label: 'Industry', value: selected.industry || 'Technology' },
                { label: 'Size', value: selected.size || '51–200' },
                { label: 'Location', value: selected.location || 'Dhaka, Bangladesh' },
                { label: 'Website', value: selected.website || 'https://example.com' },
                { label: 'Email', value: selected.email || 'hr@example.com' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mb-0.5">{label}</p>
                  <p className="text-sm text-neutral-700">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 mt-4">
            <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-3">Submitted Documents</p>
            <div className="space-y-2">
              {(selected.documents || ['trade_license.pdf']).map((doc) => (
                <div key={doc} className="flex items-center gap-2.5 py-1.5 border-b last:border-0 border-neutral-100">
                  <PdfIcon />
                  <span className="text-sm text-neutral-700 flex-1 truncate">{doc}</span>
                  <a href="#" className="text-xs text-brand-600 font-semibold hover:underline flex-shrink-0">View</a>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-neutral-400 mt-3">(Documents are simulated — no actual files)</p>
          </div>

          {/* Decision panel */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 mt-4">
            {selected.verificationStatus === 'pending' && (
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-400 mb-4">Decision</p>
                {!showRejectForm ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleApprove}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckIcon />
                      Approve Verification
                    </button>
                    <button
                      onClick={() => setShowRejectForm(true)}
                      className="w-full text-sm font-semibold text-danger-600 border border-danger-200 py-2.5 rounded-lg hover:bg-danger-50 transition-colors"
                    >
                      Reject Verification
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">Reason for rejection</label>
                      <textarea
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder="Explain what documents or information are missing or incorrect..."
                        className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowRejectForm(false); setRejectReason('') }}
                        className="flex-1 text-sm font-semibold text-neutral-600 border border-neutral-200 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRejectConfirm}
                        disabled={!rejectReason.trim()}
                        className="flex-1 text-sm font-semibold bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selected.verificationStatus === 'approved' && (
              <div>
                <div className="bg-success-50 border border-success-200 rounded-xl p-4 flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckIcon />
                  </div>
                  <p className="text-sm text-green-800 font-medium">Verified on {selected.submittedDate}</p>
                </div>
                {!showRevokeConfirm ? (
                  <button
                    onClick={() => setShowRevokeConfirm(true)}
                    className="text-sm font-semibold text-danger-600 border border-danger-200 px-4 py-2 rounded-lg hover:bg-danger-50 transition-colors"
                  >
                    Revoke verification
                  </button>
                ) : (
                  <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 space-y-3">
                    <p className="text-sm text-danger-600 font-medium">Are you sure you want to revoke this verification? The company will be moved back to pending.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRevokeConfirm(false)}
                        className="text-sm font-semibold text-neutral-600 border border-neutral-200 px-4 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRevokeConfirm}
                        className="text-sm font-semibold bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Revoke verification
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selected.verificationStatus === 'rejected' && (
              <div>
                <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 mb-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-danger-600 mb-1">Rejected</p>
                  <p className="text-sm text-danger-600">{selected.rejectionReason ?? 'No reason provided.'}</p>
                </div>
                <button
                  onClick={handleReevaluate}
                  className="text-sm font-semibold text-brand-600 border border-brand-200 px-4 py-2 rounded-lg hover:bg-brand-50 transition-colors"
                >
                  Re-evaluate
                </button>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="bg-danger-50 border border-danger-200 rounded-xl p-4 mt-6">
            <p className="text-xs font-extrabold uppercase tracking-wider text-danger-600 mb-1">Danger Zone</p>
            <p className="text-sm text-danger-600 mb-3">
              Delete Company — This will permanently remove {selected.name} and all associated internships and reviews.
            </p>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Delete company
              </button>
            ) : (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-danger-600">Type DELETE to confirm</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={deleteInput}
                    onChange={(e) => setDeleteInput(e.target.value)}
                    placeholder="DELETE"
                    className="flex-1 text-sm border border-danger-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput('') }}
                    className="text-sm font-semibold text-neutral-600 border border-neutral-200 px-3 py-1.5 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleteInput !== 'DELETE'}
                    className="text-sm font-semibold bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  /* ── QUEUE VIEW ── */
  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Success banner */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
          {successMessage}
        </div>
      )}

      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">Verification Queue</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Company
          </button>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            {pendingCount} pending
          </span>
          <span className="text-neutral-300">·</span>
          <span className="bg-success-50 text-success-700 border border-success-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            {approvedCount} approved
          </span>
          <span className="text-neutral-300">·</span>
          <span className="bg-danger-50 text-danger-600 border border-danger-200 px-2 py-0.5 rounded-full text-[11px] font-semibold">
            {rejectedCount} rejected
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-5 border-b border-neutral-200">
          {(['pending', 'all', 'approved', 'rejected'] as QueueTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setQueueTab(tab)}
              className={`px-4 py-2 text-sm font-semibold capitalize border-b-2 transition-colors -mb-px ${
                queueTab === tab
                  ? 'border-violet-600 text-brand-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab === 'all' ? 'All' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6">
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center bg-neutral-50 border-b border-neutral-200 px-5 py-3">
            <div className="flex-[3] text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Company</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Submitted</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Documents</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Status</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 text-right">Action</div>
          </div>

          {loading ? (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center border-b last:border-0 border-neutral-100 px-5 py-4 animate-pulse">
                  <div className="flex-[3] flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-neutral-200 flex-shrink-0" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-32 bg-neutral-200 rounded" />
                      <div className="h-2 w-20 bg-neutral-100 rounded" />
                    </div>
                  </div>
                  <div className="flex-1"><div className="h-3 w-16 bg-neutral-200 rounded" /></div>
                  <div className="flex-1"><div className="h-3 w-12 bg-neutral-200 rounded" /></div>
                  <div className="flex-1"><div className="h-5 w-16 bg-neutral-200 rounded-full" /></div>
                  <div className="flex-1 flex justify-end"><div className="h-5 w-20 bg-neutral-200 rounded" /></div>
                </div>
              ))}
            </>
          ) : queueFiltered.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-neutral-500">No companies in this category.</div>
          ) : (
            queueFiltered.map((company) => {
              const docs = company.documents ?? ['trade_license.pdf'];
              return (
                <div
                  key={company.id}
                  className="flex items-center border-b last:border-0 border-neutral-100 px-5 py-4 hover:bg-neutral-50 transition-colors"
                >
                  {/* Company */}
                  <div className="flex-[3] flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: company.logoBg || '#eff6ff', color: company.logoColor || '#2563eb' }}
                    >
                      {company.logo || company.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 truncate">{company.name}</p>
                      <p className="text-[10px] text-neutral-400">{company.industry || 'Technology'}</p>
                      <p className="text-[10px] text-neutral-400">{company.registrationNo || 'REG-PENDING'}</p>
                    </div>
                  </div>

                  {/* Submitted */}
                  <div className="flex-1 text-sm text-neutral-600">{company.submittedDate}</div>

                  {/* Documents */}
                  <div className="flex-1">
                    <p className="text-sm text-neutral-700">{docs.length} files</p>
                    <div className="mt-0.5">
                      {docs.slice(0, 2).map((doc) => (
                        <p key={doc} className="text-[10px] text-neutral-400 truncate max-w-[120px]">{doc}</p>
                      ))}
                      {docs.length > 2 && (
                        <p className="text-[10px] text-neutral-400">...</p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusPillClass(company.verificationStatus)}`}>
                      {statusLabel(company.verificationStatus)}
                    </span>
                  </div>

                  {/* Action */}
                  <div className="flex-1 flex justify-end">
                    {company.verificationStatus === 'pending' ? (
                      <button
                        onClick={() => setSelectedId(company.id)}
                        className="text-sm font-semibold text-brand-600 hover:underline"
                      >
                        Review →
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedId(company.id)}
                        className="text-sm font-semibold text-neutral-500 border border-neutral-200 rounded-lg px-3 py-1 hover:bg-neutral-50 transition-colors"
                      >
                        View details
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-lg font-bold text-neutral-900 mb-1">Add Company Verification</h2>
            <p className="text-xs text-neutral-500 mb-4">Create a new company entry to verify or track on the platform.</p>
            <form onSubmit={handleAddCompany} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Apex Tech Ltd."
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Industry</label>
                <input
                  type="text"
                  value={addIndustry}
                  onChange={(e) => setAddIndustry(e.target.value)}
                  placeholder="e.g. Software & IT, Finance"
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Website</label>
                <input
                  type="text"
                  value={addWebsite}
                  onChange={(e) => setAddWebsite(e.target.value)}
                  placeholder="https://company.com"
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={addDescription}
                  onChange={(e) => setAddDescription(e.target.value)}
                  placeholder="Brief description about the organization..."
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Initial Verification Status</label>
                <select
                  value={addStatus}
                  onChange={(e) => setAddStatus(e.target.value as 'Pending' | 'Approved')}
                  className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Pending">Pending (Needs Review)</option>
                  <option value="Approved">Approved (Verified immediately)</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {addLoading ? 'Saving...' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
