import type { Deployment } from '../../../types/index.ts'
import { deploymentHasInstanceOf } from './deployment-instances.ts'

describe('deploymentHasInstanceOf', () => {
    it('is false when there is no deployment yet', () => {
        expect(deploymentHasInstanceOf(undefined, 'pgadmin')).toBe(false)
    })

    it('is false when the deployment has no instance of that stack', () => {
        const deployment = { instances: [{ stackName: 'dhis2-v2' }] } as Deployment
        expect(deploymentHasInstanceOf(deployment, 'pgadmin')).toBe(false)
    })

    it('is true when the deployment already has an instance of that stack', () => {
        const deployment = { instances: [{ stackName: 'dhis2-v2' }, { stackName: 'pgadmin' }] } as Deployment
        expect(deploymentHasInstanceOf(deployment, 'pgadmin')).toBe(true)
    })
})
