import { InputFieldFF, CheckboxFieldFF, hasValue } from '@dhis2/ui'
import type { FC } from 'react'
import { Field } from 'react-final-form'
import { IMAGE_TAG, IMAGE_REPOSITORY, DATABASE_ID, IMAGE_PULL_POLICY, FLYWAY_MIGRATE_OUT_OF_ORDER, FLYWAY_REPAIR_BEFORE_MIGRATION, INSTALL_REDIS } from '../constants'
import { AsyncParameterSelect } from './async-parameter-select'
import { toTitleCase, isRequired, converter } from '../helpers'
import { ImageRepositorySelect } from './image-repository-select'
import { ImageTagSelect } from './image-tag-select'
import styles from './fields.module.css'

type ParameterFieldProps = {
    name: string
}

export const ParameterField: FC<ParameterFieldProps> = ({ name }) => {
    switch (name) {
        case IMAGE_TAG:
            return <ImageTagSelect />
        case IMAGE_REPOSITORY:
            return <ImageRepositorySelect />
        case DATABASE_ID:
        case IMAGE_PULL_POLICY:
            return <AsyncParameterSelect name={name} />
        case FLYWAY_MIGRATE_OUT_OF_ORDER:
        case FLYWAY_REPAIR_BEFORE_MIGRATION:
        case INSTALL_REDIS:
            return (
                <Field
                    type="checkbox"
                    format={converter.boolString.format}
                    parse={converter.boolString.parse}
                    required
                    name={name}
                    label={toTitleCase(name)}
                    component={CheckboxFieldFF}
                    className={styles.parameterCheckbox}
                />
            )
        default:
            return <Field required={isRequired(name)} name={name} label={toTitleCase(name)} component={InputFieldFF} validate={isRequired(name) ? hasValue : undefined} />
    }
}
