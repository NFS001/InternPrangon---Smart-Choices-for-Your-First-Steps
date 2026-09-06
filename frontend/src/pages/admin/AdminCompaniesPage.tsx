import React, { useState, useEffect } from 'react'
import type { Navigate } from '../../data/index'
import { ADMIN_COMPANIES } from '../../data/index'
import type { AdminCompany, AdminVerifStatus } from '../../data/index'
import { getAllCompaniesAdmin, addCompanyAdmin } from '../../api/client'

interface Props {
  navigate: Navigate
}

export default function AdminCompaniesPage({ navigate }: Props) {
  const [companies, setCompanies] = useState<AdminCompany[]>(ADMIN_COMPANIES)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<AdminVerifStatus | 'all'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'submitted' | 'internships'>('submitted')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Add Company Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addName, setAddName] = useState('')
  const [addIndustry, setAddIndustry] = useState('Technology')
  const [addWebsite, setAddWebsite] = useState('')
  const [addDescription, setAddDescription] = useState('')
  const [addStatus, setAddStatus] = useState<'Pending' | 'Approved'>('Pending')
  const [addLoading, setAddLoading] = useState(false)

  const fetchLiveCompanies = () => {
    getAllCompaniesAdmin()
      .then((res) => {
        if (res.companies && res.companies.length > 0) {
          const mapped: AdminCompany[] = res.companies.map((c, idx) => {
            const initials = c.companyName ? c.companyName.trim().slice(0, 2).toUpperCase() : 'CO';
            return {
              id: idx + 1,
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
              internshipCount: 2,
              reviewCount: 0,
              documents: [c.verificationDocument || 'trade_license.pdf', 'registration_cert.pdf'],
              verificationStatus: c.verificationStatus === 'Approved' ? 'approved' : c.verificationStatus === 'Rejected' ? 'rejected' : 'pending',
              submittedDate: new Date(c.createdAt || Date.now()).toLocaleDateString(),
            };
          });
          setCompanies(mapped);
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchLiveCompanies()
  }, [])

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 2500)
      return () => clearTimeout(t)
    }
  }, [successMessage])

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addName.trim()) return
    setAddLoading(true)
    try {
      await addCompanyAdmin({
        companyName: addName.trim(),
        industry: addIndustry,
        website: addWebsite.trim() || 'https://example.com',
        description: addDescription.trim() || 'Enterprise partner in Bangladesh.',
        verificationStatus: addStatus,
        verificationDocument: 'trade_license.pdf',
      })
      setSuccessMessage(`Company "${addName.trim()}" added successfully!`)
      setShowAddModal(false)
      setAddName('')
      setAddWebsite('')
      setAddDescription('')
      fetchLiveCompanies()
    } catch {
      setSuccessMessage('Failed to add company.')
    } finally {
      setAddLoading(false)
    }
  }

  const filtered = companies.filter((c) => {
    const s = search.toLowerCase()
    const matchesSearch =
      (c.name || '').toLowerCase().includes(s) ||
      (c.email || '').toLowerCase().includes(s) ||
      (c.website || '').toLowerCase().includes(s)
    const matchesStatus = statusFilter === 'all' || c.verificationStatus === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '')
    if (sortBy === 'internships') return (b.internshipCount || 0) - (a.internshipCount || 0)
    return new Date(b.submittedDate || 0).getTime() - new Date(a.submittedDate || 0).getTime()
  })

  const statusPillClass = (status: AdminVerifStatus) => {
    if (status === 'pending') return 'bg-amber-50 text-amber-700 border border-amber-200'
    if (status === 'approved') return 'bg-green-50 text-green-700 border border-green-200'
    return 'bg-red-50 text-red-600 border border-red-200'
  }

  const statusLabel = (status: AdminVerifStatus) => {
    if (status === 'pending') return 'Pending'
    if (status === 'approved') return 'Verified'
    return 'Rejected'
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-12">
      {/* Success banner */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg">
          {successMessage}
        </div>
      )}

      {/* Page header */}
      <div className="px-6 pt-8 pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-bold text-neutral-900">Companies</h1>
            <span className="text-sm text-neutral-400">{companies.length} registered</span>
          </div>
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
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10 px-6 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          />
        </div>

        {/* Status pills */}
        <div className="flex gap-1">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? 'bg-brand-600 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {s === 'all' ? 'All' : s === 'pending' ? 'Pending' : s === 'approved' ? 'Verified' : 'Rejected'}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="text-xs text-neutral-400">Sort by</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-xs border border-neutral-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white text-neutral-700"
          >
            <option value="submitted">Submission Date</option>
            <option value="name">Name</option>
            <option value="internships">Internship Count</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-5">
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          {/* Table header */}
          <div className="flex items-center bg-neutral-50 border-b border-neutral-200 px-5 py-3">
            <div className="flex-[3] text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Company</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Industry</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Status</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Internships</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Reviews</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400">Submitted</div>
            <div className="flex-1 text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 text-right">Actions</div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm text-neutral-500 mb-3">No companies match your search.</p>
              <button
                onClick={() => { setSearch(''); setStatusFilter('all') }}
                className="text-xs text-brand-600 font-semibold hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((company) => (
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
                    {company.logo || company.name?.slice(0, 2).toUpperCase() || 'CO'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-neutral-900 truncate">{company.name}</p>
                    <p className="text-[10px] text-neutral-400 truncate">
                      {company.website || 'https://example.com'} · {company.email || 'contact@example.com'}
                    </p>
                  </div>
                </div>

                {/* Industry */}
                <div className="flex-1 text-xs text-neutral-600">{company.industry || 'Technology'}</div>

                {/* Status */}
                <div className="flex-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusPillClass(company.verificationStatus)}`}>
                    {statusLabel(company.verificationStatus)}
                  </span>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{company.submittedDate}</p>
                </div>

                {/* Internships */}
                <div className="flex-1">
                  <span className="text-sm font-semibold text-neutral-700">{company.internshipCount || 0}</span>
                  <span className="text-xs text-neutral-400"> postings</span>
                </div>

                {/* Reviews */}
                <div className="flex-1 text-sm text-neutral-500">{company.reviewCount ?? 0}</div>

                {/* Submitted */}
                <div className="flex-1 text-xs text-neutral-600">{company.submittedDate}</div>

                {/* Actions */}
                <div className="flex-1 flex gap-2 justify-end">
                  {company.verificationStatus === 'pending' ? (
                    <button
                      onClick={() => navigate('admin-verifications', { companyId: company.id })}
                      className="text-xs font-semibold text-brand-600 border border-brand-200 rounded-lg px-3 py-1.5 hover:bg-brand-50 transition-colors"
                    >
                      Review
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('admin-verifications', { companyId: company.id })}
                      className="text-xs font-semibold text-neutral-600 border border-neutral-200 rounded-lg px-3 py-1.5 hover:bg-neutral-50 transition-colors"
                    >
                      {company.verificationStatus === 'approved' ? 'View' : 'Review'}
                    </button>
                  )}
                </div>
              </div>
            ))
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
