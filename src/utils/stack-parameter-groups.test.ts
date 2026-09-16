import { StackWithParameterGroups } from '../types/index.ts'
import { groupStackParameters } from './stack-parameter-groups.ts'

describe('groupStackParameters', () => {
    it('returns one section per declared group, in declaration order and sorted by priority', () => {
        const stack: StackWithParameterGroups = {
            parameterGroups: [
                { name: 'dhis2', title: 'DHIS 2 Core' },
                { name: 'db', title: 'PostgreSQL' },
            ],
            parameters: [
                { parameterName: 'DATABASE_ID', group: 'db', priority: 4 },
                { parameterName: 'IMAGE_TAG', group: 'dhis2', priority: 1 },
                { parameterName: 'STORAGE_TYPE', group: 'dhis2', priority: 10 },
            ],
        }

        const sections = groupStackParameters(stack)

        expect(sections.map((section) => section.group?.title)).toEqual(['DHIS 2 Core', 'PostgreSQL'])
        expect(sections[0].parameters.map((parameter) => parameter.parameterName)).toEqual(['IMAGE_TAG', 'STORAGE_TYPE'])
        expect(sections[1].parameters.map((parameter) => parameter.parameterName)).toEqual(['DATABASE_ID'])
    })

    it('drops groups that have no parameters', () => {
        const stack: StackWithParameterGroups = {
            parameterGroups: [
                { name: 'dhis2', title: 'DHIS 2 Core' },
                { name: 'empty', title: 'Nothing here' },
            ],
            parameters: [{ parameterName: 'IMAGE_TAG', group: 'dhis2', priority: 1 }],
        }

        expect(groupStackParameters(stack).map((section) => section.group?.title)).toEqual(['DHIS 2 Core'])
    })

    it('collects parameters of no or unknown group into a trailing section', () => {
        const stack: StackWithParameterGroups = {
            parameterGroups: [{ name: 'dhis2', title: 'DHIS 2 Core' }],
            parameters: [
                { parameterName: 'IMAGE_TAG', group: 'dhis2', priority: 1 },
                { parameterName: 'LEGACY', priority: 2 },
                { parameterName: 'STRAY', group: 'gone', priority: 3 },
            ],
        }

        const sections = groupStackParameters(stack)

        expect(sections).toHaveLength(2)
        expect(sections[1].group).toBeUndefined()
        expect(sections[1].parameters.map((parameter) => parameter.parameterName)).toEqual(['LEGACY', 'STRAY'])
    })

    it('returns a single ungrouped section for a stack without groups', () => {
        const stack: StackWithParameterGroups = { parameters: [{ parameterName: 'IMAGE_TAG', priority: 1 }] }

        const sections = groupStackParameters(stack)

        expect(sections).toHaveLength(1)
        expect(sections[0].group).toBeUndefined()
    })

    it('handles a missing stack', () => {
        expect(groupStackParameters(undefined)).toEqual([])
    })
})
