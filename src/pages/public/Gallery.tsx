import { useCollection } from '../../hooks/useCollection'
import type { GalleryItem } from '../../types'
import kidsImg from '../../assets/images/kids-training.jpg'
import huddleImg from '../../assets/images/team-huddle.jpg'
import conesImg from '../../assets/images/cones-training.jpg'
import stadiumImg from '../../assets/images/stadium.jpg'

const SEED_IMAGES = [kidsImg, huddleImg, conesImg, stadiumImg]

export default function Gallery() {
  const { data } = useCollection<GalleryItem>('gallery')
  const images = data.length > 0 ? data.map((d) => d.imageUrl) : SEED_IMAGES

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 pb-28 md:px-8 lg:pb-16">
      <p className="eyebrow text-grass">Gallery</p>
      <h1 className="mt-2 text-4xl text-pitch md:text-5xl">On the pitch</h1>

      <div className="mt-10 columns-2 gap-3 md:columns-3 [&>*]:mb-3">
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full rounded-card object-cover" />
        ))}
      </div>
    </div>
  )
}
