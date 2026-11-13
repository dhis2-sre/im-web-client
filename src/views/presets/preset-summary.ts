import { useDatabaseLabel } from '../../hooks/index.ts'
import type { Deployment } from '../../types/index.ts'

export const PRESET_STACK = 'dhis2-v2'

const COMPANION_FLAGS: [string, string][] = [
    ['ENABLE_PGADMIN', 'pgAdmin'],
    ['ENABLE_DORIS', 'Doris'],
    ['DEPLOY_CHAP', 'CHAP'],
]

export const presetMainInstance = (preset: Deployment, mainStackName = PRESET_STACK) => preset.instances?.find((instance) => instance.stackName === mainStackName)

/* The settings that tell presets apart at a glance: the DHIS2 version, the database it starts from, where files are kept and which companions come along. */
export const presetSummary = (preset: Deployment, mainStackName = PRESET_STACK) => {
    const parameters = presetMainInstance(preset, mainStackName)?.parameters ?? {}
    const valueOf = (name: string) => parameters[name]?.value ?? ''

    return {
        version: valueOf('IMAGE_TAG'),
        databaseId: valueOf('DATABASE_ID'),
        storage: valueOf('STORAGE_TYPE'),
        companions: COMPANION_FLAGS.filter(([parameter]) => valueOf(parameter) === 'true').map(([, name]) => name),
    }
}

/* The summary with the database resolved from its id to the name it was picked by. */
export const usePresetSummary = (preset: Deployment, mainStackName = PRESET_STACK) => {
    const { databaseId, ...summary } = presetSummary(preset, mainStackName)
    const { label: database } = useDatabaseLabel(databaseId)

    return { ...summary, database }
}
