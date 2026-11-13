import type { DeploymentInstanceComponents, InstanceComponentReplica } from '../../../types/index.ts'
import { deploymentHealth, deploymentStatus } from './component-health.ts'

const replica = (phase: string, ready: boolean): InstanceComponentReplica => ({ name: `${phase}-${ready}`, phase, ready, restarts: 0, createdAt: '', containers: [] })

const deployment = (...replicaSets: InstanceComponentReplica[][]): DeploymentInstanceComponents[] =>
    [{ instanceId: 1, stackName: 'dhis2-v2', components: replicaSets.map((replicas, index) => ({ name: `c${index}`, replicas })) }] as DeploymentInstanceComponents[]

describe('deploymentHealth', () => {
    it('is healthy only when every replica runs and is ready', () => {
        expect(deploymentHealth(deployment([replica('Running', true)], [replica('Running', true)]))).toBe('healthy')
    })

    it('has errors when any replica failed, whatever else is pending', () => {
        expect(deploymentHealth(deployment([replica('Running', true)], [replica('Pending', false)], [replica('Failed', false)]))).toBe('errors')
    })

    it('is pending while a replica is not ready or a component has none', () => {
        expect(deploymentHealth(deployment([replica('Running', true)], [replica('Running', false)]))).toBe('pending')
        expect(deploymentHealth(deployment([replica('Running', true)], []))).toBe('pending')
    })

    it('is pending with no components at all', () => {
        expect(deploymentHealth([])).toBe('pending')
    })
})

describe('deploymentStatus', () => {
    const healthy = deployment([replica('Running', true)])

    it('puts a failed deploy ahead of one under way and of the components', () => {
        expect(deploymentStatus([{ deployStatus: 'deploying' }, { deployStatus: 'failed', deployError: 'timed out' }], healthy)).toEqual({
            label: 'Failed',
            tone: 'negative',
            detail: 'timed out',
        })
        expect(deploymentStatus([{ deployStatus: 'deployed' }, { deployStatus: 'pending' }], healthy)?.label).toBe('Deploying')
    })

    it('is the health of the components once deployed', () => {
        expect(deploymentStatus([{ deployStatus: 'deployed' }], healthy)?.label).toBe('Healthy')
        expect(deploymentStatus([{ deployStatus: 'deployed' }], deployment([replica('Failed', false)]))?.label).toBe('Has errors')
    })

    it('says nothing until the components are known, or without stacks', () => {
        expect(deploymentStatus([{ deployStatus: 'deployed' }], undefined)).toBeUndefined()
        expect(deploymentStatus([], [])).toBeUndefined()
    })
})
