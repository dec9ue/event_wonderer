import api from './client'
import { Floor, FloorList } from '../types/dto'

export function listFloors(): Promise<FloorList> {
  return api.get('/api/floors')
}

export function getFloor(id: string): Promise<Floor> {
  return api.get(`/api/floors/${id}`)
}

export function getFloorImageUrl(id: string): Promise<{ url: string }> {
  return api.get(`/api/floors/${id}/image/presigned-get`)
}
