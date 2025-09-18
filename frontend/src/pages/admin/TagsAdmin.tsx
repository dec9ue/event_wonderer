import React from 'react'
import { listTags, createTag, updateTag, deleteTag } from '../../api/tags'
import { Tag } from '../../types/dto'

export default function TagsAdmin() {
  const [tags, setTags] = React.useState<Tag[]>([])
  const [name, setName] = React.useState('')
  async function refresh() { const r = await listTags(); setTags(r.items) }
  React.useEffect(() => { refresh() }, [])

  return (
    <div style={{ padding: 16 }}>
      <h2>Tags</h2>
      <div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name"/>
        <button onClick={async () => { if (!name) return; await createTag(name); setName(''); refresh() }}>Add</button>
      </div>
      <ul>
        {tags.map((t) => (
          <li key={t.id}>
            <input defaultValue={t.name} onBlur={async (e) => { if (e.target.value !== t.name) { await updateTag(t.id, e.target.value); refresh() } }} />
            <button onClick={async () => { if (!confirm('Delete tag?')) return; await deleteTag(t.id); refresh() }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
