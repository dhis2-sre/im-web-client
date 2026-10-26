import type { DeploymentInstanceComponents, InstanceComponentReplica } from '../../../types/index.ts'
import { deploymentHealth } from './component-health.ts'

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
