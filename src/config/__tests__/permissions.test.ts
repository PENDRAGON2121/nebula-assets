import { describe, expect, it } from 'vitest'
import { PERMISSIONS, ALL_PERMISSIONS } from '@/config/permissions'

describe('permissions config', () => {
  it('exposes every permission value through ALL_PERMISSIONS', () => {
    const flattened = Object.values(PERMISSIONS).flatMap((group) =>
      Object.values(group)
    )

    expect(new Set(ALL_PERMISSIONS)).toEqual(new Set(flattened))
    expect(ALL_PERMISSIONS.length).toBe(flattened.length)
  })
})
