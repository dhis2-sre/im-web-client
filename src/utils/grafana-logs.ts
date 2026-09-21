/* Empty when no dashboard is configured, which hides the links rather than pointing them nowhere. */
const dashboardUrl = window._env_?.GRAFANA_LOGS_URL || import.meta.env.VITE_GRAFANA_LOGS_URL || ''

type LogsTarget = {
    namespace?: string
    deploymentId?: number
    instanceName?: string
    component?: string
}

/* Grafana reads the log lines of a component from Loki's im_type label, which carries the same
 * component names this app shows, so no mapping between the two is needed. */
export const grafanaLogsUrl = ({ namespace, deploymentId, instanceName, component }: LogsTarget): string | undefined => {
    if (!dashboardUrl || !namespace || !deploymentId) {
        return undefined
    }

    const url = new URL(dashboardUrl)
    url.searchParams.set('orgId', '1')
    url.searchParams.set('var-Namespace', namespace)
    url.searchParams.set('var-DeploymentId', String(deploymentId))
    if (instanceName) {
        url.searchParams.set('var-Instance', instanceName)
    }
    url.searchParams.set('var-Component', component ?? '$__all')

    return url.toString()
}
