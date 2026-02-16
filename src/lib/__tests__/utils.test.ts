import { describe, expect, it } from 'vitest'
import { cn, toJSON } from '@/lib/utils'

describe('cn', () => {
  it('merges class names and resolves Tailwind conflicts', () => {
    const result = cn('px-2', 'px-4', 'text-red-500', 'text-blue-500', null, undefined)
    expect(result).toBe('px-4 text-blue-500')
  })

  it('filters falsy values while preserving valid classes', () => {
    const result = cn('block', false && 'hidden', '', undefined, 'mt-2')
    expect(result).toBe('block mt-2')
  })
})

describe('toJSON', () => {
  it('creates a deep clone using JSON serialization', () => {
    const original = { a: 1, nested: { b: 2 } }
    const clone = toJSON(original)

    expect(clone).toEqual(original)
    expect(clone).not.toBe(original)
    expect(clone.nested).not.toBe(original.nested)
  })

  it('strips unsupported values like undefined when cloning', () => {
    const original = { a: 1, skip: undefined as undefined | number }
    const clone = toJSON(original)

    expect(clone).toEqual({ a: 1 })
  })
})
