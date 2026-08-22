'use client'

import { useState, useTransition } from 'react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { updatePrivateInfo } from '../../app/actions/profile'

export default function PrivateInfoTab({ profile, isAdmin, isSelf }) {
  const canEdit = isAdmin || isSelf
  const bank = profile.bank_details || {}

  const [formData, setFormData] = useState({
    phone: profile.phone || '',
    address: profile.address || '',
    personal_email: profile.personal_email || '',
    gender: profile.gender || 'Not specified',
    marital_status: profile.marital_status || 'Single',
    nationality: profile.nationality || 'Indian',
    bank_name: bank.bank_name || '',
    account_number: bank.account_number || '',
    ifsc_code: bank.ifsc_code || '',
    job_title: profile.job_title || '',
    department: profile.department || '',
    pan_no: profile.pan_no || '',
    pf_no: profile.pf_no || '',
    aadhar_no: profile.aadhar_no || '',
  })

  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = (e) => {
    e.preventDefault()
    setMessage(null)

    startTransition(async () => {
      const res = await updatePrivateInfo(profile.id, formData)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Private information updated successfully.' })
      }
    })
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {message && (
        <div
          className={`p-3 rounded-[6px] text-xs font-medium ${
            message.type === 'success'
              ? 'bg-sage/10 border border-sage/30 text-sage'
              : 'bg-rose/10 border border-rose/30 text-rose'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Organization Info */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Organizational Position
          </h4>
          {!isAdmin && (
            <span className="text-[10px] text-slate font-mono-ledger bg-paper px-2 py-0.5 rounded border border-border">
              Managed by HR
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Job Title"
            id="job_title"
            name="job_title"
            value={formData.job_title}
            onChange={handleChange}
            disabled={!isAdmin}
          />

          <Input
            label="Department"
            id="department"
            name="department"
            value={formData.department}
            onChange={handleChange}
            disabled={!isAdmin}
          />
        </div>
      </div>

      {/* Personal & Contact Details */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Personal & Contact Details
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Personal Email"
            id="personal_email"
            name="personal_email"
            type="email"
            value={formData.personal_email}
            onChange={handleChange}
            placeholder="personal@gmail.com"
            disabled={!canEdit}
          />

          <Input
            label="Contact Phone"
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            disabled={!canEdit}
          />
        </div>

        <div>
          <Input
            label="Residential Address"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Street address, City, Postal Code"
            disabled={!canEdit}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={!canEdit}
              className="w-full bg-surface border border-border rounded-[6px] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber disabled:bg-paper disabled:text-slate"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
              Marital Status
            </label>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              disabled={!canEdit}
              className="w-full bg-surface border border-border rounded-[6px] px-3.5 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber disabled:bg-paper disabled:text-slate"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </select>
          </div>

          <Input
            label="Nationality"
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
            disabled={!canEdit}
          />
        </div>
      </div>

      {/* Bank & Financial Details */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Bank & Disbursement Details
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Bank Name"
            id="bank_name"
            name="bank_name"
            value={formData.bank_name}
            onChange={handleChange}
            placeholder="e.g. HDFC Bank"
            disabled={!canEdit}
          />

          <Input
            label="Account Number"
            id="account_number"
            name="account_number"
            value={formData.account_number}
            onChange={handleChange}
            placeholder="e.g. 50100234567890"
            disabled={!canEdit}
            mono
          />

          <Input
            label="IFSC Code"
            id="ifsc_code"
            name="ifsc_code"
            value={formData.ifsc_code}
            onChange={handleChange}
            placeholder="e.g. HDFC0001234"
            disabled={!canEdit}
            mono
          />
        </div>
      </div>

      {/* Statutory Identity Identifiers */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink">
            Statutory Identifiers (Tax & Provident Fund)
          </h4>
          {!isAdmin && (
            <span className="text-[10px] text-slate font-mono-ledger bg-paper px-2 py-0.5 rounded border border-border">
              Admin Restricted
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="PAN Card Number"
            id="pan_no"
            name="pan_no"
            value={formData.pan_no}
            onChange={handleChange}
            placeholder="ABCDE1234F"
            disabled={!isAdmin}
            mono
          />

          <Input
            label="PF / UAN Number"
            id="pf_no"
            name="pf_no"
            value={formData.pf_no}
            onChange={handleChange}
            placeholder="100987654321"
            disabled={!isAdmin}
            mono
          />

          <Input
            label="Aadhar Number"
            id="aadhar_no"
            name="aadhar_no"
            value={formData.aadhar_no}
            onChange={handleChange}
            placeholder="XXXX-XXXX-XXXX"
            disabled={!isAdmin}
            mono
          />
        </div>
      </div>

      {canEdit && (
        <div className="flex justify-end pt-2">
          <Button variant="amber" type="submit" disabled={isPending}>
            {isPending ? 'Saving Information...' : 'Save Private Information'}
          </Button>
        </div>
      )}
    </form>
  )
}
