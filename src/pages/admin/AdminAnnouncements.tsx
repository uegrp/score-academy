import { useState } from 'react'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Announcement } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'

type FormState = { title: string; body: string; category: Announcement['category']; published: boolean }
const emptyForm: FormState = { title: '', body: '', category: 'news', published: true }

export default function AdminAnnouncements() {
  const { data: items, loading } = useCollection<Announcement>('announcements')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const sorted = [...items].sort((a, b) => b.publishedAt - a.publishedAt)

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setStatus(null)
    setModalOpen(true)
  }

  function openEdit(a: Announcement) {
    setEditingId(a.id)
    setForm({ title: a.title, body: a.body, category: a.category, published: a.published })
    setStatus(null)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setStatus(null)
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        published: form.published,
        publishedAt: editingId ? (items.find((a) => a.id === editingId)?.publishedAt ?? Date.now()) : Date.now(),
      }
      if (editingId) {
        await updateDocById('announcements', editingId, payload)
        setStatus({ type: 'success', message: 'Announcement updated.' })
      } else {
        await createDoc('announcements', payload)
        setStatus({ type: 'success', message: 'Announcement published.' })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(a: Announcement) {
    try {
      await updateDocById('announcements', a.id, { published: !a.published })
      setStatus({ type: 'success', message: a.published ? 'Unpublished.' : 'Published.' })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to update.' })
    }
  }

  async function handleDelete(a: Announcement) {
    if (!confirm(`Delete "${a.title}"?`)) return
    try {
      await deleteDocById('announcements', a.id)
      setStatus({ type: 'success', message: 'Deleted.' })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : 'Failed to delete.' })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">News & announcements</h1>
        <Button size="sm" onClick={openAdd}>
          + New announcement
        </Button>
      </div>

      <StatusBanner status={status} />

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : sorted.length === 0 ? (
          <EmptyState title="No announcements yet" hint="Publish news, training or match updates for the academy." />
        ) : (
          <div className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {sorted.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-pitch">{a.title}</p>
                  <p className="text-sm text-pitch/60">
                    {a.category} · {new Date(a.publishedAt).toLocaleDateString()} ·{' '}
                    <span className={a.published ? 'text-grass' : 'text-pitch/40'}>
                      {a.published ? 'Published' : 'Draft'}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="!text-pitch !border-line-soft" onClick={() => togglePublish(a)}>
                    {a.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(a)}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(a)}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit announcement' : 'New announcement'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label="Body"
            required
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <Select
            label="Category"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Announcement['category'] })}
            options={[
              { value: 'news', label: 'News' },
              { value: 'training', label: 'Training' },
              { value: 'match', label: 'Match' },
              { value: 'event', label: 'Event' },
              { value: 'notice', label: 'Notice' },
            ]}
          />
          <label className="flex items-center gap-2 text-sm text-pitch/80">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 rounded border-line-soft"
            />
            Publish immediately
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Save changes' : 'Publish'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
