import { COMPANION_LABELS } from '../../../constants.ts'
import type { GroupedParameters } from '../../../hooks/use-grouped-stack-parameters.ts'
import type { StackCompanion } from '../../../types/index.ts'

/* An optional component of an instance, switched on by a 'true'/'false' parameter of the main stack. What it
 * brings is whatever the stack gates on that parameter: a companion stack, sections of the main stack, or
 * nothing to set at all. */
export type AddOn = {
    parameter: string
    name: string
    description: string
    companion?: StackCompanion
    groups: GroupedParameters[]
    /* Where the add-on is served, after the instance's own path, for one with nothing to set. */
    pathSuffix?: string
}

/* How each add-on is introduced. The stack says what a parameter switches on but not how to describe it. */
const ADD_ON_INFO: Record<string, { name: string; description: string; pathSuffix?: string }> = {
    DEPLOY_CHAP: { name: 'CHAP', description: 'Climate and health modelling for DHIS2.' },
    ENABLE_DORIS: { name: 'Doris', description: 'A separate database for analytics.' },
    ENABLE_PGADMIN: { name: 'pgAdmin', description: "Web console for the instance's database." },
    /* shortcut: mirrors the ingress path in im-manager's dhis2-v2 helmfile; read it from the stack if the stack ever declares it. */
    DEPLOY_GLOWROOT: { name: 'Glowroot', description: 'Performance monitoring for DHIS2.', pathSuffix: '-glowroot' },
}

const switchesOn = (parameter: string, when?: { parameter: string; equals: string }) => when?.parameter === parameter && when.equals === 'true'

/* The main stack's parameters that switch a component on, in the stack's order: the ones a companion or a
 * section is gated on, and the described ones that switch something on inside the main stack's own release. */
export const findAddOns = (groups: GroupedParameters[], companions: StackCompanion[]): AddOn[] =>
    groups
        .flatMap(({ parameters }) => parameters)
        .map(({ parameterName = '', displayName }): AddOn | undefined => {
            const companion = companions.find(({ when }) => switchesOn(parameterName, when))
            const gated = groups.filter(({ group }) => switchesOn(parameterName, group.when))
            const info = ADD_ON_INFO[parameterName]
            if (!info && !companion && gated.length === 0) {
                return undefined
            }
            return {
                parameter: parameterName,
                name: info?.name ?? (companion && COMPANION_LABELS[companion.name]) ?? displayName ?? parameterName,
                description: info?.description ?? '',
                companion,
                groups: gated,
                pathSuffix: info?.pathSuffix,
            }
        })
        .filter((addOn): addOn is AddOn => !!addOn)
