import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../../lib/firebase'
import { useCollection } from '../../hooks/useCollection'
import { createDoc, deleteDocById, updateDocById } from '../../lib/collections'
import type { GalleryItem } from '../../types'
import EmptyState from '../../components/ui/EmptyState'
import Button from '../../components/ui/Button'
import StatusBanner from '../../components/ui/StatusBanner'
import { Select } from '../../components/ui/FormField'

const CATEGORIES: GalleryItem['category'][] = ['training', 'match', 'team', 'event']

export default function AdminGallery() {
  const { t } = useTranslation()
  const { data: items, loading } = useCollection<GalleryItem>('gallery')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState<GalleryItem['category']>('training')
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const categoryLabel: Record<string, string> = {
    training: t('admin.galleryPageForm.catTraining'),
    match: t('admin.galleryPageForm.catMatch'),
    team: t('admin.galleryPageForm.catTeam'),
    event: t('admin.galleryPageForm.catEvent'),
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setStatus(null)
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue
        if (file.size > 8 * 1024 * 1024) {
          setStatus({ type: 'error', message: t('admin.galleryPageForm.fileTooLarge', { name: file.name }) })
          continue
        }
        const path = `gallery/${Date.now()}-${file.name}`
        const storageRef = ref(storage, path)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        await createDoc('gallery', {
          imageUrl: url,
          category,
          uploadedAt: Date.now(),
        })
      }
      setStatus({ type: 'success', message: t('admin.galleryPageForm.photosUploaded') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.galleryPageForm.uploadFailed') })
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(item: GalleryItem) {
    if (!confirm(t('admin.galleryPageForm.deleteConfirm'))) return
    try {
      // Best-effort storage cleanup — Firestore doc is the source of truth for the UI.
      try {
        const url = new URL(item.imageUrl)
        const path = decodeURIComponent(url.pathname.split('/o/')[1]?.split('?')[0] ?? '')
        if (path) await deleteObject(ref(storage, path))
      } catch {
        // Non-fatal — the underlying file may already be gone or the URL shape differs.
      }
      await deleteDocById('gallery', item.id)
      setStatus({ type: 'success', message: t('admin.galleryPageForm.deleted') })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.playersPage.failedDelete') })
    }
  }

  async function handleRecategorize(item: GalleryItem, newCategory: GalleryItem['category']) {
    try {
      await updateDocById('gallery', item.id, { category: newCategory })
    } catch (err) {
      setStatus({ type: 'error', message: err instanceof Error ? err.message : t('admin.galleryPageForm.failedUpdate') })
    }
  }

  const sorted = [...items].sort((a, b) => b.uploadedAt - a.uploadedAt)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl text-pitch">{t('admin.galleryPage')}</h1>
      </div>

      <StatusBanner status={status} />

      <div className="mt-5 flex flex-wrap items-end gap-3 rounded-card border border-line-soft bg-white p-4">
        <div className="w-48">
          <Select
            label={t('admin.galleryPageForm.categoryForUpload')}
            value={category}
            onChange={(e) => setCategory(e.target.value as GalleryItem['category'])}
            options={CATEGORIES.map((c) => ({ value: c, label: categoryLabel[c] }))}
          />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
          id="gallery-upload"
        />
        <label htmlFor="gallery-upload">
          <Button
            type="button"
            loading={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? t('admin.galleryPageForm.uploading') : `+ ${t('admin.galleryPageForm.uploadPhotos')}`}
          </Button>
        </label>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="h-40 animate-pulse rounded-card bg-line-soft/30" />
        ) : sorted.length === 0 ? (
          <EmptyState title={t('emptyStates.noGallery')} hint={t('emptyStates.noGalleryHint')} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-card border border-line-soft">
                <img src={item.imageUrl} alt={item.caption ?? item.category} className="aspect-square w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-pitch/80 p-2">
                  <select
                    value={item.category}
                    onChange={(e) => handleRecategorize(item, e.target.value as GalleryItem['category'])}
                    className="rounded bg-transparent text-xs text-bone"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="text-pitch">
                        {categoryLabel[c]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(item)}
                    className="rounded-full bg-danger px-2 py-0.5 text-xs text-bone"
                  >
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
