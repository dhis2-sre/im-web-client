import type { InstanceComponentReplica } from '../../types/index.ts'
import { deployStatus, replicaStatus } from './statuses.ts'

const replica = (phase: string, ready: boolean): InstanceComponentReplica => ({ name: 'r', phase, ready, restarts: 0, createdAt: '', containers: [] })

describe('deployStatus', () => {
    it('reports a failed deploy with its error', () => {
        expect(deployStatus({ deployStatus: 'failed', deployError: 'image not found' })).toEqual({ label: 'Failed', tone: 'negative', detail: 'image not found' })
    })

    it('treats pending and deploying alike', () => {
        expect(deployStatus({ deployStatus: 'pending' })).toEqual({ label: 'Deploying', tone: 'progress' })
        expect(deployStatus({ deployStatus: 'deploying' })).toEqual({ label: 'Deploying', tone: 'progress' })
    })

    it('reports a finished deploy', () => {
        expect(deployStatus({ deployStatus: 'deployed' })).toEqual({ label: 'Deployed', tone: 'positive' })
    })

    it('has nothing to say about an instance without a deploy status', () => {
        expect(deployStatus({})).toBeUndefined()
    })
})

describe('replicaStatus', () => {
    it('is positive only when running and ready', () => {
        expect(replicaStatus(replica('Running', true))).toEqual({ label: 'Running', tone: 'positive' })
        expect(replicaStatus(replica('Running', false))).toEqual({ label: 'Running (not ready)', tone: 'neutral' })
    })

    it('is negative for a failed replica', () => {
        expect(replicaStatus(replica('Failed', false)).tone).toBe('negative')
    })

    it('is neutral while pending', () => {
        expect(replicaStatus(replica('Pending', false))).toEqual({ label: 'Pending (not ready)', tone: 'neutral' })
    })
})
