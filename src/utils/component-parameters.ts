import { DeploymentInstanceParameters, StackParameterGroup, StackWithParameterGroups } from '../types/index.ts'

export type ParameterEntry = {
    name: string
    displayName: string
    sensitive: boolean
    value: string
}

export type GroupedComponentParameters = {
    /* Parameters belonging to each present component, keyed by component name. */
    byComponent: Record<string, ParameterEntry[]>
    /* Parameters of a stack that declares no groups, or of groups that belong to no component.
     * Callers render these as one list for the instance, which is what every stack looked like
     * before parameter groups existed. */
    leftover: ParameterEntry[]
}

const conditionHolds = (group: StackParameterGroup, parameters: DeploymentInstanceParameters) => !group.when || parameters[group.when.parameter]?.value === group.when.equals

/* Assigns an instance's parameters to the components they configure, using the groups the stacks
 * API serves. A group named after a present component is that component's, e.g. the minio group and
 * the minio component. A conditional group belongs wherever its enabling parameter lives, mirroring
 * how the deploy form nests it: the S3 group hangs off the component owning STORAGE_TYPE. Groups
 * whose condition does not hold describe a backend that is not in use, so their parameters are
 * dropped instead of shown as noise. */
export const groupParametersByComponent = (
    instanceParameters: DeploymentInstanceParameters | undefined,
    stack: StackWithParameterGroups | undefined,
    componentNames: string[]
): GroupedComponentParameters => {
    if (!instanceParameters) {
        return { byComponent: {}, leftover: [] }
    }

    const metadata = new Map((stack?.parameters ?? []).map((parameter) => [parameter.parameterName ?? '', parameter]))
    const groups = stack?.parameterGroups ?? []

    const ownerOfGroup = new Map<string, string | undefined>()
    const inapplicableGroups = new Set<string>()
    for (const group of groups) {
        if (!conditionHolds(group, instanceParameters)) {
            inapplicableGroups.add(group.name)
            continue
        }
        if (componentNames.includes(group.name)) {
            ownerOfGroup.set(group.name, group.name)
            continue
        }
        const enablingGroup = group.when ? metadata.get(group.when.parameter)?.group : undefined
        ownerOfGroup.set(group.name, enablingGroup && componentNames.includes(enablingGroup) ? enablingGroup : undefined)
    }

    const byComponent: Record<string, ParameterEntry[]> = {}
    const leftover: ParameterEntry[] = []
    const priorityOf = new Map<string, number>()

    for (const [name, parameter] of Object.entries(instanceParameters)) {
        const meta = metadata.get(name)
        const groupName = meta?.group
        if (groupName && inapplicableGroups.has(groupName)) {
            continue
        }

        priorityOf.set(name, meta?.priority ?? 0)
        const entry: ParameterEntry = {
            name,
            displayName: meta?.displayName || name,
            sensitive: meta?.sensitive ?? false,
            value: parameter?.value ?? '',
        }

        const owner = groupName ? ownerOfGroup.get(groupName) : undefined
        if (owner) {
            byComponent[owner] = [...(byComponent[owner] ?? []), entry]
        } else {
            leftover.push(entry)
        }
    }

    const byPriority = (a: ParameterEntry, b: ParameterEntry) => (priorityOf.get(a.name) ?? 0) - (priorityOf.get(b.name) ?? 0)
    Object.values(byComponent).forEach((entries) => entries.sort(byPriority))
    leftover.sort(byPriority)

    return { byComponent, leftover }
}
