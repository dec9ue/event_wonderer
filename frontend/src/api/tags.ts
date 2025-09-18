import api from './client'
import { Tag, TagList } from '../types/dto'

export function listTags(): Promise<TagList> {
  return api.get('/api/tags')
}

export function createTag(name: string): Promise<Tag> {
  return api.post('/api/tags', { name })
}

export function updateTag(id: string, name: string): Promise<Tag> {
  return api.patch(`/api/tags/${id}`, { name })
}

export function deleteTag(id: string): Promise<void> {
  return api.delete(`/api/tags/${id}`)
}
