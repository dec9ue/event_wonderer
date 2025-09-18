import React from 'react'
import { t } from '../i18n'

export default function ReportFilters({ value, onChange }: { value: any; onChange: (v: any) => void }) {
  const [keyword, setKeyword] = React.useState<string>('')
  React.useEffect(() => {
    const next = { ...value, q: keyword }
    onChange(next)
  }, [keyword])
  return (
    <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
      <label>
        {t('keyword')}
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Search…" />
      </label>
    </div>
  )
}
