import type { FC } from 'react'
import { IMAGE_TAG, IMAGE_REPOSITORY, DATABASE_ID, IMAGE_PULL_POLICY, FLYWAY_MIGRATE_OUT_OF_ORDER, FLYWAY_REPAIR_BEFORE_MIGRATION, INSTALL_REDIS } from '../constants'
import { IntergrationParameterSelect } from './intergration-parameter-select'
import { ImageRepositorySelect } from './image-repository-select'
import { ImageTagSelect } from './image-tag-select'
import { BooleanParameterCheckbox } from './boolean-parameter-checkbox'
import { TextParameterInput } from './text-parameter-input'

export type ParameterFieldProps = {
    displayName: string
    parameterName: string
}

export const ParameterField: FC<ParameterFieldProps> = ({ displayName, parameterName }) => {
    switch (parameterName) {
        case IMAGE_TAG:
            return <ImageTagSelect displayName={displayName} />
        case IMAGE_REPOSITORY:
            return <ImageRepositorySelect displayName={displayName} />
        case DATABASE_ID:
        case IMAGE_PULL_POLICY:
            return <IntergrationParameterSelect displayName={displayName} parameterName={parameterName} />
        case FLYWAY_MIGRATE_OUT_OF_ORDER:
        case FLYWAY_REPAIR_BEFORE_MIGRATION:
        case INSTALL_REDIS:
            return <BooleanParameterCheckbox displayName={displayName} parameterName={parameterName} />
        default:
            return <TextParameterInput displayName={displayName} parameterName={parameterName} />
    }
}
