import type { FC } from 'react'
import {
    IMAGE_TAG,
    IMAGE_REPOSITORY,
    DATABASE_ID,
    IMAGE_PULL_POLICY,
    FLYWAY_MIGRATE_OUT_OF_ORDER,
    FLYWAY_REPAIR_BEFORE_MIGRATION,
    INSTALL_REDIS,
    PGADMIN_USERNAME,
    PGADMIN_PASSWORD,
    PGADMIN_CONFIRM_PASSWORD
} from '../constants'
import { IntergrationParameterSelect } from './intergration-parameter-select'
import { ImageRepositorySelect } from './image-repository-select'
import { ImageTagSelect } from './image-tag-select'
import { BooleanParameterCheckbox } from './boolean-parameter-checkbox'
import { TextParameterInput } from './text-parameter-input'
import { Dhis2StackName } from '../parameter-fieldset'
import { ConfirmPasswordInput } from './confirm-password'

export type ParameterFieldProps = {
    displayName: string
    parameterName: string
    stackId: Dhis2StackName
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
        case FLYWAY_MIGRATE_OUT_OF_ORDER:
        case FLYWAY_REPAIR_BEFORE_MIGRATION:
        case INSTALL_REDIS:
            return <BooleanParameterCheckbox stackId={stackId} parameterName={parameterName} displayName={displayName} />
        case PGADMIN_USERNAME:
            return <TextParameterInput stackId={stackId} parameterName={parameterName} displayName={'pgAdmin Email'} type="email" />
        case PGADMIN_PASSWORD:
            return <TextParameterInput stackId={stackId} parameterName={parameterName} displayName={displayName} type="password" />
        case PGADMIN_CONFIRM_PASSWORD:
            return <ConfirmPasswordInput stackId={stackId} />
        default:
            return <TextParameterInput stackId={stackId} parameterName={parameterName} displayName={displayName} />
    }
}
