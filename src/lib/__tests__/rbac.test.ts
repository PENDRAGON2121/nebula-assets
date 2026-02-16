import { describe, expect, it } from 'vitest'
import { hasPermission } from '@/lib/rbac'

describe('hasPermission', () => {
  const permission = 'users:read'

  it('returns false when user is missing', () => {
    expect(hasPermission(undefined, permission)).toBe(false)
  })

  it('grants access to admins automatically', () => {
    const adminUser = { role: 'ADMIN', permissions: [] }
    expect(hasPermission(adminUser, permission)).toBe(true)
  })

  it('checks explicit permissions for non-admin users', () => {
    const regularUser = { role: 'USER', permissions: [permission] }
    expect(hasPermission(regularUser, permission)).toBe(true)
  })

  it('denies access when permission is missing', () => {
    const regularUser = { role: 'USER', permissions: ['assets:read'] }
    expect(hasPermission(regularUser, permission)).toBe(false)
  })
})
