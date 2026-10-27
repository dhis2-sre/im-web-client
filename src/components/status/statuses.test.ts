import type { InstanceComponentReplica } from '../../types/index.ts'
import { componentStatus, deployStatus, replicaStatus } from './statuses.ts'

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

describe('componentStatus', () => {
    const component = (...replicas: InstanceComponentReplica[]) => ({ name: 'c', supportedOperations: [], replicas })

    it('speaks for a single replica in its own words', () => {
        expect(componentStatus(component(replica('Running', false)))).toEqual({ label: 'Running (not ready)', tone: 'neutral' })
    })

    it('counts ready replicas when there are several', () => {
        expect(componentStatus(component(replica('Running', true), replica('Running', true)))).toEqual({ label: '2/2 ready', tone: 'positive' })
        expect(componentStatus(component(replica('Running', true), replica('Pending', false)))).toEqual({ label: '1/2 ready', tone: 'neutral' })
    })

    it('is negative when any replica failed', () => {
        expect(componentStatus(component(replica('Running', true), replica('Failed', false), replica('Running', true)))).toEqual({ label: '2/3 ready', tone: 'negative' })
    })

    it('says so when there are no replicas', () => {
        expect(componentStatus(component())).toEqual({ label: 'No replicas', tone: 'neutral' })
    })
})
