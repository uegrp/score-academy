import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, updateDocById, deleteDocById } from '../../lib/collections'
import type { Announcement } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Textarea, Select } from '../../components/ui/FormField'
import StatusBanner from '../../components/ui/StatusBanner'
import { StaggerContainer, StaggerItem } from '../../components/motion/Stagger'
import FloatingActionButton from '../../components/ui/FloatingActionButton'

type FormState = { title: string; body: string; category: Announcement['category']; published: boolean }
const emptyForm: FormState = { title: '', body: '', category: 'news', published: true }

export default function AdminAnnouncements() {
  const { t } = useTranslation()
  const { data: items, loading } = useCollection<Announcement>('announcements')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const sorted = [...items].sort((a, b) => b.publishedAt - a.publishedAt)

  const categoryLabel: Record<string, string> = {
    news: t('admin.announcementsPageForm.catNews'),
    training: t('admin.announcementsPageForm.catTraining'),
    match: t('admin.announcementsPageForm.catMatch'),
    event: t('admin.announcementsPageForm.catEvent'),
    notice: t('admin.announcementsPageForm.catNotice'),
  }

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
        setStatus({ type: 'success', message: t('admin.announcementsPageForm.updated') })
      } else {
        await createDoc('announcements', payload)
        setStatus({ type: 'success', message: t('admin.announcementsPageForm.published') })
      }
      setModalOpen(false)
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.somethingWrong') })
    } finally {
      setSaving(false)
    }
  }

  async function togglePublish(a: Announcement) {
    try {
      await updateDocById('announcements', a.id, { published: !a.published })
      setStatus({
        type: 'success',
        message: a.published ? t('admin.announcementsPageForm.unpublished') : t('admin.announcementsPageForm.publishedShort'),
      })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.announcementsPageForm.failedUpdate') })
    }
  }

  async function handleDelete(a: Announcement) {
    if (!confirm(t('admin.announcementsPageForm.deleteConfirm', { title: a.title }))) return
    try {
      await deleteDocById('announcements', a.id)
      setStatus({ type: 'success', message: t('admin.announcementsPageForm.deleted') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedDelete') })
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">{t('admin.newsPage')}</h1>
        <Button size="sm" onClick={openAdd} className="hidden lg:inline-flex">
          + {t('admin.newAnnouncement')}
        </Button>
      </div>
      <FloatingActionButton onClick={openAdd} label={t('admin.newAnnouncement')} />

      <StatusBanner status={status} />

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : sorted.length === 0 ? (
          <EmptyState title={t('emptyStates.noAnnouncements')} hint={t('emptyStates.noAnnouncementsHint')} />
        ) : (
          <StaggerContainer className="divide-y divide-line-soft rounded-card border border-line-soft bg-white">
            {sorted.map((a) => (
              <StaggerItem key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium text-pitch">{a.title}</p>
                  <p className="text-sm text-pitch/60">
                    {categoryLabel[a.category]} · {new Date(a.publishedAt).toLocaleDateString()} ·{' '}
                    <span className={a.published ? 'text-grass' : 'text-pitch/40'}>
                      {a.published ? t('common.published') : t('common.draft')}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" className="!text-pitch !border-line-soft" onClick={() => togglePublish(a)}>
                    {a.published ? t('admin.announcementsPageForm.unpublish') : t('admin.announcementsPageForm.publish')}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => openEdit(a)}>
                    {t('common.edit')}
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(a)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? t('common.edit') : t('admin.newAnnouncement')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('admin.announcementsPageForm.title')}
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Textarea
            label={t('admin.announcementsPageForm.body')}
            required
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />
          <Select
            label={t('admin.announcementsPageForm.category')}
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Announcement['category'] })}
            options={[
              { value: 'news', label: t('admin.announcementsPageForm.catNews') },
              { value: 'training', label: t('admin.announcementsPageForm.catTraining') },
              { value: 'match', label: t('admin.announcementsPageForm.catMatch') },
              { value: 'event', label: t('admin.announcementsPageForm.catEvent') },
              { value: 'notice', label: t('admin.announcementsPageForm.catNotice') },
            ]}
          />
          <label className="flex items-center gap-2 text-sm text-pitch/80">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm({ ...form, published: e.target.checked })}
              className="h-4 w-4 rounded border-line-soft"
            />
            {t('admin.announcementsPageForm.publishImmediately')}
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? t('common.save') : t('admin.announcementsPageForm.publish')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
