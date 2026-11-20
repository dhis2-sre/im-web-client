import type { FC } from 'react'
import {
    CUSTOM_DHIS2_CONFIG,
    DATABASE_ID,
    ENABLE_QUERY_LOGGING,
    FLYWAY_MIGRATE_OUT_OF_ORDER,
    FLYWAY_REPAIR_BEFORE_MIGRATION,
    IMAGE_PULL_POLICY,
    IMAGE_REPOSITORY,
    IMAGE_TAG,
    WORKER_IMAGE_TAG,
    WORKER_IMAGE_PULL_POLICY,
    PARAMETER_LABELS,
    PGADMIN_PASSWORD,
    PGADMIN_USERNAME,
    STORAGE_TYPE,
    SAME_SITE_COOKIES,
    DEPLOY_CHAP,
    DHIS2_ENABLED,
    DHIS2_REGISTER,
    ENABLE_DORIS,
    ENABLE_PGADMIN,
    ALLOW_SUSPEND,
    DEPLOY_GLOWROOT,
    Dhis2StackName,
} from '../parameters.ts'
import { BooleanParameterCheckbox } from './boolean-parameter-checkbox.tsx'
import { ImageRepositorySelect } from './image-repository-select.tsx'
import { ImageTagSelect } from './image-tag-select.tsx'
import { ImmutableDatabaseField } from './immutable-database-field.tsx'
import { ImmutableParameterField } from './immutable-parameter-field.tsx'
import { IntergrationParameterSelect } from './intergration-parameter-select.tsx'
import { SameSiteCookiesSelect } from './same-site-cookies-select.tsx'
import { TextParameterInput } from './text-parameter-input.tsx'
import { TextareaParameter } from './textarea-parameter.tsx'

/* Parameters the stacks keep as 'true'/'false' strings, rendered as checkboxes. A section lists them after its other fields. */
export const BOOLEAN_PARAMETERS = new Set([
    FLYWAY_MIGRATE_OUT_OF_ORDER,
    FLYWAY_REPAIR_BEFORE_MIGRATION,
    ENABLE_QUERY_LOGGING,
    DEPLOY_CHAP,
    DHIS2_ENABLED,
    DHIS2_REGISTER,
    ENABLE_DORIS,
    ENABLE_PGADMIN,
    ALLOW_SUSPEND,
    DEPLOY_GLOWROOT,
])

export type ParameterFieldProps = {
    displayName: string
    parameterName: string
    stackId: Dhis2StackName
    // Used by other components that use ParameterFieldProps
    // eslint-disable-next-line react/no-unused-prop-types
    type?: string
    sensitive?: boolean
    required?: boolean
    formMode?: 'create' | 'update'
    /* Set while editing a deployed instance whose stack says this parameter can no longer change. */
    immutableReason?: string
}

export const ParameterField: FC<ParameterFieldProps> = ({ stackId, displayName, parameterName, sensitive, required, formMode, immutableReason }) => {
    if (immutableReason) {
        if (parameterName === DATABASE_ID) {
            return <ImmutableDatabaseField stackId={stackId} parameterName={parameterName} displayName={displayName} reason={immutableReason} />
        }
        return <ImmutableParameterField stackId={stackId} parameterName={parameterName} displayName={displayName} reason={immutableReason} />
    }

    if (BOOLEAN_PARAMETERS.has(parameterName)) {
        return <BooleanParameterCheckbox stackId={stackId} parameterName={parameterName} displayName={displayName} />
    }

    switch (parameterName) {
        case IMAGE_TAG:
            if (stackId === 'chap') {
                return <ImageTagSelect displayName={displayName} stackId={stackId} organization="dhis2-chap" repository="chap-core" registry="ghcr" />
            }
            return <ImageTagSelect displayName={displayName} stackId={stackId} />
        // The chap worker runs its own image, so it carries its own tag rather than sharing the api's.
        case WORKER_IMAGE_TAG:
            return <ImageTagSelect displayName={displayName} stackId={stackId} parameterName={parameterName} organization="dhis2-chap" repository="chap-worker" registry="ghcr" />
        case IMAGE_REPOSITORY:
            return <ImageRepositorySelect displayName={displayName} stackId={stackId} />
        case DATABASE_ID:
        case IMAGE_PULL_POLICY:
        case WORKER_IMAGE_PULL_POLICY:
            return <IntergrationParameterSelect stackId={stackId} parameterName={parameterName} displayName={displayName} />
        case STORAGE_TYPE:
            return <IntergrationParameterSelect stackId={stackId} parameterName={parameterName} displayName={displayName} />
        case SAME_SITE_COOKIES:
            return <SameSiteCookiesSelect stackId={stackId} parameterName={parameterName} displayName={displayName} />
        case PGADMIN_USERNAME:
            return (
                <TextParameterInput
                    stackId={stackId}
                    parameterName={parameterName}
                    displayName={PARAMETER_LABELS[PGADMIN_USERNAME]}
                    type="email"
                    sensitive={sensitive}
                    required={required}
                    formMode={formMode}
                />
            )
        case PGADMIN_PASSWORD:
            return (
                <TextParameterInput
                    stackId={stackId}
                    parameterName={parameterName}
                    displayName={displayName}
                    type="password"
                    sensitive={sensitive}
                    required={required}
                    formMode={formMode}
                />
            )
        case CUSTOM_DHIS2_CONFIG:
            return <TextareaParameter stackId={stackId} parameterName={parameterName} displayName={displayName} sensitive={sensitive} formMode={formMode} />
        default:
            return <TextParameterInput stackId={stackId} parameterName={parameterName} displayName={displayName} sensitive={sensitive} required={required} formMode={formMode} />
    }
}
