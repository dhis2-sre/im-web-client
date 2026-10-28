import { DAY_IN_SECONDS, extendingPresets, HOUR_IN_SECONDS, lifetimeError, TTL_PRESETS } from './ttl-presets.ts'

describe('extendingPresets', () => {
    it('leaves out every preset that would end sooner than the instance does now', () => {
        // Created a day ago with six days to live, so five days are left.
        const labels = extendingPresets(DAY_IN_SECONDS, 6 * DAY_IN_SECONDS).map((preset) => preset.label)
        expect(labels).toEqual(['1 week', '2 weeks', '1 month'])
    })

    it('leaves out a preset that would end at the same moment', () => {
        const labels = extendingPresets(0, DAY_IN_SECONDS).map((preset) => preset.label)
        expect(labels).not.toContain('1 day')
        expect(labels).toContain('2 days')
    })

    it('offers them all once the instance has expired', () => {
        expect(extendingPresets(2 * DAY_IN_SECONDS, HOUR_IN_SECONDS)).toEqual(TTL_PRESETS)
    })
})

describe('lifetimeError', () => {
    // Created a day ago with six days to live, so it ends five days from now.
    const instance = { ageSeconds: DAY_IN_SECONDS, ttlSeconds: 6 * DAY_IN_SECONDS }

    it('refuses an end in the past', () => {
        expect(lifetimeError(DAY_IN_SECONDS - 1, { ...instance, extendOnly: false })).toBe('Pick a date in the future.')
    })

    it('lets the edit form shorten a lifetime', () => {
        expect(lifetimeError(2 * DAY_IN_SECONDS, { ...instance, extendOnly: false })).toBeUndefined()
    })

    it('refuses an end that is not later when extending', () => {
        expect(lifetimeError(2 * DAY_IN_SECONDS, { ...instance, extendOnly: true })).toBe('Pick a date after it currently expires.')
        expect(lifetimeError(6 * DAY_IN_SECONDS, { ...instance, extendOnly: true })).toBe('Pick a date after it currently expires.')
    })

    it('accepts a later end when extending', () => {
        expect(lifetimeError(6 * DAY_IN_SECONDS + 1, { ...instance, extendOnly: true })).toBeUndefined()
    })

    it('says nothing before a lifetime is picked', () => {
        expect(lifetimeError(0, { ...instance, extendOnly: true })).toBeUndefined()
    })
})
