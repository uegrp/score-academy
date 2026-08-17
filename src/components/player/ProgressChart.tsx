import { useTranslation } from 'react-i18next'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import type { PerformanceEvaluation } from '../../types'
import { computeFifaAttributes } from '../../lib/fifaCard'

interface Props {
  /** Ascending by date. */
  evaluations: PerformanceEvaluation[]
}

/**
 * Plots the player's real evaluation history — every point comes from an
 * actual coach evaluation via computeFifaAttributes(); nothing here is
 * synthetic or interpolated.
 */
export default function ProgressChart({ evaluations }: Props) {
  const { t } = useTranslation()

  const data = evaluations.map((ev) => {
    const attrs = computeFifaAttributes(ev)
    return {
      date: new Date(ev.date).toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
      overall: attrs.overall,
      pac: attrs.pac,
      sho: attrs.sho,
      pas: attrs.pas,
      dri: attrs.dri,
      def: attrs.def,
      phy: attrs.phy,
    }
  })

  if (data.length < 2) return null

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('player.progressPage.overallTrend')}</p>
        <div className="h-56 rounded-card border border-line-soft bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} stroke="var(--color-pitch)" />
              <YAxis domain={[0, 100]} fontSize={12} stroke="var(--color-pitch)" />
              <Tooltip />
              <Line type="monotone" dataKey="overall" stroke="var(--color-grass)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-pitch/60">{t('player.progressPage.attributeTrend')}</p>
        <div className="h-64 rounded-card border border-line-soft bg-white p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" opacity={0.3} />
              <XAxis dataKey="date" fontSize={12} stroke="var(--color-pitch)" />
              <YAxis domain={[0, 100]} fontSize={12} stroke="var(--color-pitch)" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="pac" name="PAC" stroke="#2563eb" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="sho" name="SHO" stroke="#dc2626" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="pas" name="PAS" stroke="#16a34a" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="dri" name="DRI" stroke="#ca8a04" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="def" name="DEF" stroke="#9333ea" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="phy" name="PHY" stroke="#0891b2" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
