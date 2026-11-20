import { errorMessage } from './error-message.ts'

describe('errorMessage', () => {
    it('prefers the reason the server sent', () => {
        expect(errorMessage({ response: { data: 'database is locked' } })).toBe('database is locked')
        expect(errorMessage({ response: { data: { message: 'name taken' } } })).toBe('name taken')
    })

    it('falls back to the error itself', () => {
        expect(errorMessage(Object.assign(new Error('Network Error'), { response: { data: '' } }))).toBe('Network Error')
        expect(errorMessage('boom')).toBe('boom')
    })
})
