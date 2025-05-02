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
    INSTALL_REDIS,
    PGADMIN_CONFIRM_PASSWORD,
    PGADMIN_PASSWORD,
    PGADMIN_USERNAME,
    STORAGE_TYPE,
    SAME_SITE_COOKIES,
} from '../constants.ts'
import { Dhis2StackName } from '../parameter-fieldset.tsx'
import { BooleanParameterCheckbox } from './boolean-parameter-checkbox.tsx'
import { ConfirmPasswordInput } from './confirm-password.tsx'
import { ImageRepositorySelect } from './image-repository-select.tsx'
import { ImageTagSelect } from './image-tag-select.tsx'
import { IntergrationParameterSelect } from './intergration-parameter-select.tsx'
import { SameSiteCookiesSelect } from './same-site-cookies-select.tsx'
import { TextParameterInput } from './text-parameter-input.tsx'
import { TextareaParameter } from './textarea-parameter.tsx'

export type ParameterFieldProps = {
    displayName: string
    parameterName: string
    stackId: Dhis2StackName
    // Used by other components that use ParameterFieldProps
    // eslint-disable-next-line react/no-unused-prop-types
    type?: string
}

export const ParameterField: FC<ParameterFieldProps> = ({ stackId, displayName, parameterName }) => {
    switch (parameterName) {
        case IMAGE_TAG:
            return <ImageTagSelect displayName={displayName} />
        case IMAGE_REPOSITORY:
            return <ImageRepositorySelect displayName={displayName} />
        case DATABASE_ID:
        case IMAGE_PULL_POLICY:
            return <IntergrationParameterSelect stackId={stackId} parameterName={parameterName} displayName={displayName} />
        case STORAGE_TYPE:
            return <IntergrationParameterSelect stackId={stackId} parameterName={parameterName} displayName={displayName} />
        case SAME_SITE_COOKIES:
            return <SameSiteCookiesSelect stackId={stackId} parameterName={parameterName} displayName={displayName} />
        case FLYWAY_MIGRATE_OUT_OF_ORDER:
        case FLYWAY_REPAIR_BEFORE_MIGRATION:
        case ENABLE_QUERY_LOGGING:
        case INSTALL_REDIS:
            return <BooleanParameterCheckbox stackId={stackId} parameterName={parameterName} displayName={displayName} />
        case PGADMIN_USERNAME:
            return <TextParameterInput stackId={stackId} parameterName={parameterName} displayName={'pgAdmin Email'} type="email" />
        case PGADMIN_PASSWORD:
            return <TextParameterInput stackId={stackId} parameterName={parameterName} displayName={displayName} type="password" />
        case PGADMIN_CONFIRM_PASSWORD:
            return <ConfirmPasswordInput stackId={stackId} />
        case CUSTOM_DHIS2_CONFIG:
            return <TextareaParameter stackId={stackId} parameterName={parameterName} displayName={displayName} />
        default:
            return <TextParameterInput stackId={stackId} parameterName={parameterName} displayName={displayName} />
    }
}
