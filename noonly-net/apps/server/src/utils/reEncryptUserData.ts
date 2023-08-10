import { redis } from '../database/redis'

class BlockerStore {
  _getKey(userId: string) {
    return `blocker-store:${userId}`
  }

  async setBlocked(userId: string, blocked: boolean, reason = 'Access temporarily blocked') {
    await redis.set(this._getKey(userId), JSON.stringify({ blocked, reason }))
  }

  async isBlocked(userId: string) {
    const data = await redis.get(this._getKey(userId))
    if (data)
      return JSON.parse(data)
    return { blocked: false, reason: '' }
  }
}

export const blockerStore = new BlockerStore()

export async function reEncryptUserData(userId: string, oldKey: string, newKey: string) {
  // TODO: re-encrypt user data
}