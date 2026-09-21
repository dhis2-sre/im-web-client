/* Empty when no dashboard is configured, which hides the links rather than pointing them nowhere. */
const dashboardUrl = window._env_?.GRAFANA_LOGS_URL || import.meta.env.VITE_GRAFANA_LOGS_URL || ''

type LogsTarget = {
    namespace?: string
    instanceName?: string
    groupId?: number
    component?: string
}

/* The dashboard matches an instance on Loki's instance label, which holds the helm release name,
 * and its components hang off that name as suffixes. That is the unique name the instance manager
 * deploys under, so it is rebuilt here the same way. Components are matched on im_type, which
 * carries the same component names this app shows. */
export const grafanaLogsUrl = ({ namespace, instanceName, groupId, component }: LogsTarget): string | undefined => {
    if (!dashboardUrl || !namespace || !instanceName || groupId === undefined) {
        return undefined
    }

    const url = new URL(dashboardUrl)
    url.searchParams.set('orgId', '1')
    url.searchParams.set('var-Namespace', namespace)
    url.searchParams.set('var-Instance', `${instanceName}-${groupId}`)
    url.searchParams.set('var-Component', component ?? '$__all')

    return url.toString()
}
