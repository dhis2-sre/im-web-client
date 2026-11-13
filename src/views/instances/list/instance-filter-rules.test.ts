import type { Deployment } from '../../../types/index.ts'
import { isExpiringSoon, readFilters } from './instance-filter-rules.ts'

const HOUR = 60 * 60 * 1000
const now = Date.parse('2026-10-26T12:00:00Z')
const deployment = (createdHoursAgo: number, ttlHours: number) => ({ createdAt: new Date(now - createdHoursAgo * HOUR).toISOString(), ttl: ttlHours * 3600 }) as Deployment

describe('readFilters', () => {
    it('reads every filter from its parameter', () => {
        expect(readFilters(new URLSearchParams('q=sl&group=whoami&status=errors&expiring=1'))).toEqual({ search: 'sl', group: 'whoami', status: 'errors', expiringSoon: true })
    })

    it('falls back to the defaults for missing or unknown values', () => {
        expect(readFilters(new URLSearchParams('status=broken&expiring=yes'))).toEqual({ search: '', group: 'all', status: 'all', expiringSoon: false })
    })
})

describe('isExpiringSoon', () => {
    it('is true only with under a day left', () => {
        expect(isExpiringSoon(deployment(1, 24), now)).toBe(true)
        expect(isExpiringSoon(deployment(0, 48), now)).toBe(false)
    })

    it('is false once the instance has expired', () => {
        expect(isExpiringSoon(deployment(25, 24), now)).toBe(false)
    })
})
