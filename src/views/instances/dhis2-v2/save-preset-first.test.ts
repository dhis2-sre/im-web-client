import { savePresetFirst } from './save-preset-first.ts'

describe('savePresetFirst', () => {
    test('saves the preset before anything else and unticks the box', async () => {
        const calls: string[] = []
        const form = { change: jest.fn(() => calls.push('untick')) }
        const savePreset = jest.fn(async () => {
            calls.push('save')
            return undefined
        })
        expect(await savePresetFirst({ saveAsPreset: true }, form, savePreset)).toBeUndefined()
        expect(calls).toEqual(['save', 'untick'])
        expect(form.change).toHaveBeenCalledWith('saveAsPreset', false)
    })

    test("leaves the box ticked and reports the error when the preset can't be saved", async () => {
        const form = { change: jest.fn() }
        expect(await savePresetFirst({ saveAsPreset: true }, form, async () => 'Taken')).toBe('Taken')
        expect(form.change).not.toHaveBeenCalled()
    })

    test("doesn't save again once unticked, as when a failed create is retried", async () => {
        const savePreset = jest.fn()
        expect(await savePresetFirst({ saveAsPreset: false }, { change: jest.fn() }, savePreset)).toBeUndefined()
        expect(savePreset).not.toHaveBeenCalled()
    })
})
