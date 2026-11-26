import { DHIS2_STACK } from '../../constants.ts'
import type { Deployment } from '../../types/index.ts'

const COMPANION_FLAGS: [string, string][] = [
    ['ENABLE_PGADMIN', 'pgAdmin'],
    ['ENABLE_DORIS', 'Doris'],
    ['DEPLOY_CHAP', 'CHAP'],
]

export const presetMainInstance = (preset: Deployment, mainStackName = DHIS2_STACK) => preset.instances?.find((instance) => instance.stackName === mainStackName)

/* The settings that tell presets apart at a glance: the DHIS2 version, the database it starts from, where files are kept and which companions come along. */
export const presetSummary = (preset: Deployment, mainStackName = DHIS2_STACK) => {
    const parameters = presetMainInstance(preset, mainStackName)?.parameters ?? {}
    const valueOf = (name: string) => parameters[name]?.value ?? ''

    return {
        version: valueOf('IMAGE_TAG'),
        databaseId: valueOf('DATABASE_ID'),
        storage: valueOf('STORAGE_TYPE'),
        companions: COMPANION_FLAGS.filter(([parameter]) => valueOf(parameter) === 'true').map(([, name]) => name),
    }
}
