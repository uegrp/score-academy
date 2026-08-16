import { useState } from 'react'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Program } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

type FormState = { name: string; ageRange: string; description: string; price: string; order: string }
const emptyForm: FormState = { name: '', ageRange: '', description: '', price: '', order: '0' }

export default function AdminPrograms() {
  const { data: programs, loading } = useCollection<Program>('programs')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const sorted = [...programs].sort((a, b) => a.order - b.order)

  function openAdd() {
    setEditingId(null)
    setForm({ ...emptyForm, order: String(programs.length) })
    setStatus(null)
    setModalOpen(true)
  }

  function openEdit(p: Program) {
    setEditingId(p.id)
    setForm({
      name: p.name,
      ageRange: p.ageRange,
      description: p.description,
      price: p.price ?? '',
      order: String(p.order),
    })
    setStatus(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload = {
        name: form.name.trim(),
        ageRange: form.ageRange.trim(),
        description: form.description.trim(),
        price: form.price.trim() || undefined,
        order: Number(form.order) || 0,
      }
      if (editingId) {
        await updateDocById('programs', editingId, payload)
        setStatus({ type: 'success', message: 'Program updated.' })
      } else {
        await createDoc('programs', payload)
        setStatus({ type: 'success', message: 'Program created.' })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(p: Program) {
    if (!confirm(`Delete program "${p.name}"?`)) return
    try {
      await deleteDocById('programs', p.id)
      setStatus({ type: 'success', message: `${p.name} deleted.` })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete.' })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">Training programs</h1>
        <Button size="sm" onClick={openAdd}>
          + Add program
        </Button>
      </div>

      <StatusBanner status={status} />

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : sorted.length === 0 ? (
          <EmptyState title="No programs yet" hint="Add age-group programs shown on the public Programs page." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {sorted.map((p) => (
              <div key={p.id} className="rounded-card border border-line-soft bg-white p-5">
                <p className="text-lg font-semibold text-pitch">{p.name}</p>
                <p className="text-sm text-pitch/60">{p.ageRange}</p>
                <p className="mt-2 text-sm text-pitch/70">{p.description}</p>
                {p.price && <p className="mt-2 text-sm font-medium text-grass">{p.price}</p>}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => openEdit(p)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(p)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit program' : 'Add program'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Program name"
            required
            placeholder="e.g. Mini Stars"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Age range"
            required
            placeholder="e.g. Ages 5–7"
            value={form.ageRange}
            onChange={(e) => setForm({ ...form, ageRange: e.target.value })}
          />
          <Textarea
            label="Description"
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Price (optional)"
              placeholder="e.g. EGP 1,500/month"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <Input
              label="Display order"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Save changes' : 'Add program'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
