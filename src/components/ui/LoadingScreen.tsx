import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import logo from '../../assets/images/score-logo.png'

export default function LoadingScreen() {
  const { t } = useTranslation()
  return (
    <div className="flex min-h-screen items-center justify-center bg-pitch">
      <div className="flex flex-col items-center gap-4">
        <motion.img
          src={logo}
          alt="SCORE"
          className="h-10 w-auto rounded-md bg-bone px-2 py-1 object-contain"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <div className="h-1.5 w-32 overflow-hidden rounded-pill bg-line-soft">
          <motion.div
            className="h-full rounded-pill bg-gradient-to-r from-grass to-gold"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <p className="eyebrow text-bone-dim">{t('common.loadingScore')}</p>
      </div>
    </div>
  )
}
