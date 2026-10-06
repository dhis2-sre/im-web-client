import { validateDnsLabel } from './validate-dns-label.ts'

export type DeploymentNameAvailability = { available: boolean; reason?: string }
type FetchAvailability = (group: string, name: string) => Promise<DeploymentNameAvailability>

/* Final-form runs field validators on every change to any field and only applies the latest run,
 * so answers are cached per group and name, and a run superseded during the debounce never asks. */
export const createDeploymentNameValidator = (fetchAvailability: FetchAvailability, delay = 300) => {
    const answers = new Map<string, string | undefined>()
    let latestRun = 0

    return (name = '', values: { groupName?: string } = {}) => {
        const formatError = validateDnsLabel(name)
        const group = values.groupName
        if (formatError || !group) {
            return formatError
        }

        const key = `${group}/${name}`
        if (answers.has(key)) {
            return answers.get(key)
        }

        const run = ++latestRun
        return new Promise<string | undefined>((resolve) => setTimeout(resolve, delay)).then(async () => {
            if (run !== latestRun) {
                return undefined
            }
            try {
                const { available, reason } = await fetchAvailability(group, name)
                const error = available ? undefined : (reason ?? 'Name is not available')
                answers.set(key, error)
                return error
            } catch {
                return undefined
            }
        })
    }
}
