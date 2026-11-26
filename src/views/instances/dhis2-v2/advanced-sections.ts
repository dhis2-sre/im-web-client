/* How a section's advanced settings are sorted into named sub-sections, by stack and group. The stacks group
 * parameters by component only, so this is the form's own map; anything it doesn't name goes last, under
 * "Other settings". A card made of several groups (a companion) sub-sections by group instead. */
export const ADVANCED_SECTIONS: Record<string, Array<[string, string[]]>> = {
    'dhis2-v2/dhis2': [
        ['Image and resources', ['IMAGE_PULL_POLICY', 'CORE_RESOURCES_REQUESTS_CPU', 'CORE_RESOURCES_REQUESTS_MEMORY', 'DHIS2_HOME', 'CHART_VERSION', 'JAVA_OPTS']],
        [
            'Health checks',
            ['MIN_READY_SECONDS', 'LIVENESS_PROBE_TIMEOUT_SECONDS', 'READINESS_PROBE_TIMEOUT_SECONDS', 'STARTUP_PROBE_FAILURE_THRESHOLD', 'STARTUP_PROBE_PERIOD_SECONDS'],
        ],
        ['Configuration', ['SAME_SITE_COOKIES', 'CUSTOM_DHIS2_CONFIG', 'ALLOW_SUSPEND']],
        ['Google sign-in', ['GOOGLE_AUTH_PROJECT_ID', 'GOOGLE_AUTH_CLIENT_ID', 'GOOGLE_AUTH_CLIENT_EMAIL', 'GOOGLE_AUTH_PRIVATE_KEY_ID', 'GOOGLE_AUTH_PRIVATE_KEY']],
        ['Database migrations', ['FLYWAY_MIGRATE_OUT_OF_ORDER', 'FLYWAY_REPAIR_BEFORE_MIGRATION', 'ENABLE_QUERY_LOGGING']],
    ],
    'dhis2-v2/db': [
        ['Connection', ['DATABASE_NAME', 'DATABASE_USERNAME', 'DATABASE_PASSWORD']],
        ['Resources', ['DB_RESOURCES_REQUESTS_CPU', 'DB_RESOURCES_REQUESTS_MEMORY']],
    ],
}

export const OTHER_SETTINGS = 'Other settings'
