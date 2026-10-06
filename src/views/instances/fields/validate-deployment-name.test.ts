import { createDeploymentNameValidator } from './validate-deployment-name.ts'

describe('createDeploymentNameValidator', () => {
    test('reports a badly formed name without asking the server', () => {
        const fetchAvailability = jest.fn()
        const validate = createDeploymentNameValidator(fetchAvailability, 0)

        expect(validate('1abc', { groupName: 'group' })).toBe('Name must start with a lowercase letter')
        expect(fetchAvailability).not.toHaveBeenCalled()
    })

    test('reports a taken name and remembers the answer', async () => {
        const fetchAvailability = jest.fn().mockResolvedValue({ available: false, reason: 'taken' })
        const validate = createDeploymentNameValidator(fetchAvailability, 0)

        await expect(validate('abc', { groupName: 'group' })).resolves.toBe('taken')
        expect(validate('abc', { groupName: 'group' })).toBe('taken')
        expect(fetchAvailability).toHaveBeenCalledTimes(1)
        expect(fetchAvailability).toHaveBeenCalledWith('group', 'abc')
    })

    test('asks again when the group changes', async () => {
        const fetchAvailability = jest.fn().mockResolvedValue({ available: true })
        const validate = createDeploymentNameValidator(fetchAvailability, 0)

        await expect(validate('abc', { groupName: 'one' })).resolves.toBeUndefined()
        await expect(validate('abc', { groupName: 'two' })).resolves.toBeUndefined()
        expect(fetchAvailability).toHaveBeenCalledTimes(2)
    })

    test('only the latest of several quick runs asks the server', async () => {
        const fetchAvailability = jest.fn().mockResolvedValue({ available: true })
        const validate = createDeploymentNameValidator(fetchAvailability, 10)

        const first = validate('ab', { groupName: 'group' })
        const second = validate('abc', { groupName: 'group' })
        await Promise.all([first, second])

        expect(fetchAvailability).toHaveBeenCalledTimes(1)
        expect(fetchAvailability).toHaveBeenCalledWith('group', 'abc')
    })

    test('lets the name through when the check itself fails', async () => {
        const fetchAvailability = jest.fn().mockRejectedValue(new Error('network'))
        const validate = createDeploymentNameValidator(fetchAvailability, 0)

        await expect(validate('abc', { groupName: 'group' })).resolves.toBeUndefined()
    })
})
