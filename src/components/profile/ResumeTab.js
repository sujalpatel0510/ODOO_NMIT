'use client'

import { useState, useTransition } from 'react'
import Button from '../ui/Button'
import { updateResume } from '../../app/actions/profile'

export default function ResumeTab({ profileId, initialData, canEdit }) {
  const [about, setAbout] = useState(initialData?.about || '')
  const [jobLoveNote, setJobLoveNote] = useState(initialData?.job_love_note || '')
  const [hobbiesNote, setHobbiesNote] = useState(initialData?.hobbies_note || '')
  const [skills, setSkills] = useState(Array.isArray(initialData?.skills) ? initialData.skills : ['JavaScript', 'React', 'Team Collaboration'])
  const [certifications, setCertifications] = useState(Array.isArray(initialData?.certifications) ? initialData.certifications : ['Certified Professional'])
  
  const [newSkill, setNewSkill] = useState('')
  const [newCert, setNewCert] = useState('')
  
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState(null)

  const handleAddSkill = (e) => {
    e.preventDefault()
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    if (!canEdit) return
    setSkills(skills.filter(s => s !== skillToRemove))
  }

  const handleAddCert = (e) => {
    e.preventDefault()
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()])
      setNewCert('')
    }
  }

  const handleRemoveCert = (certToRemove) => {
    if (!canEdit) return
    setCertifications(certifications.filter(c => c !== certToRemove))
  }

  const handleSave = () => {
    setMessage(null)
    startTransition(async () => {
      const res = await updateResume(profileId, {
        about,
        job_love_note: jobLoveNote,
        hobbies_note: hobbiesNote,
        skills,
        certifications,
      })

      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Resume entries saved successfully.' })
      }
    })
  }

  return (
    <div className="space-y-6">
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

      {/* About Section */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          About & Background
        </h4>
        <div>
          <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
            Professional Summary
          </label>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            disabled={!canEdit}
            rows={3}
            placeholder="Brief overview of professional background, focus areas, and key responsibilities..."
            className="w-full bg-surface border border-border rounded-[6px] p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber disabled:bg-paper disabled:text-slate"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
              What I Love About My Job
            </label>
            <textarea
              value={jobLoveNote}
              onChange={(e) => setJobLoveNote(e.target.value)}
              disabled={!canEdit}
              rows={2}
              placeholder="e.g. Solving complex engineering bottlenecks, collaborating across teams..."
              className="w-full bg-surface border border-border rounded-[6px] p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber disabled:bg-paper disabled:text-slate"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate uppercase tracking-wider mb-1.5">
              Interests & Hobbies
            </label>
            <textarea
              value={hobbiesNote}
              onChange={(e) => setHobbiesNote(e.target.value)}
              disabled={!canEdit}
              rows={2}
              placeholder="e.g. Open-source development, chess, photography..."
              className="w-full bg-surface border border-border rounded-[6px] p-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-amber disabled:bg-paper disabled:text-slate"
            />
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Skills & Competencies
        </h4>

        {canEdit && (
          <form onSubmit={handleAddSkill} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Add skill (e.g. TypeScript, Next.js)"
              className="flex-1 bg-surface border border-border rounded-[6px] px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-amber"
            />
            <Button variant="secondary" size="sm" type="submit">
              + Add
            </Button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {skills.length === 0 ? (
            <span className="text-xs text-slate font-mono-ledger">No skills logged yet.</span>
          ) : (
            skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-paper border border-border rounded-[4px] text-xs font-medium text-ink"
              >
                {skill}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate hover:text-rose transition-colors ml-0.5"
                    aria-label={`Remove ${skill}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="ledger-card p-6 bg-surface space-y-4">
        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-ink pb-2 border-b border-border">
          Certifications & Credentials
        </h4>

        {canEdit && (
          <form onSubmit={handleAddCert} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              placeholder="Add certification (e.g. AWS Solutions Architect)"
              className="flex-1 bg-surface border border-border rounded-[6px] px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-amber"
            />
            <Button variant="secondary" size="sm" type="submit">
              + Add
            </Button>
          </form>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {certifications.length === 0 ? (
            <span className="text-xs text-slate font-mono-ledger">No certifications logged yet.</span>
          ) : (
            certifications.map((cert) => (
              <span
                key={cert}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-paper border border-border rounded-[4px] text-xs font-medium text-ink"
              >
                <span className="text-amber">✦</span>
                {cert}
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(cert)}
                    className="text-slate hover:text-rose transition-colors ml-0.5"
                    aria-label={`Remove ${cert}`}
                  >
                    ×
                  </button>
                )}
              </span>
            ))
          )}
        </div>
      </div>

      {canEdit && (
        <div className="flex justify-end pt-2">
          <Button variant="amber" onClick={handleSave} disabled={isPending}>
            {isPending ? 'Saving Resume...' : 'Save Resume Changes'}
          </Button>
        </div>
      )}
    </div>
  )
}
