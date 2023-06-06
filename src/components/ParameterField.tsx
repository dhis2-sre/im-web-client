import { InputField, CheckboxField } from '@dhis2/ui'
import styles from './ParameterField.module.css'

const toTitleCase = (string) =>
    string
        .toLowerCase()
        .replace(/^[-_]*(.)/, (_, c) => c.toUpperCase())
        .replace(/[-_]+(.)/g, (_, c) => ' ' + c.toUpperCase())

export const ParameterField = ({
    name,
    onChange,
    required,
    defaultValue,
}: {
    name: string
    onChange: Function
    required?: boolean
    defaultValue: string
}) => {
    switch (name) {
        case 'DATABASE_ID':
        case 'IMAGE_REPOSITORY':
        case 'IMAGE_TAG':
        case 'SOURCE_ID':
        case 'PRESET_ID':
            return <h1>Dropdown</h1>

        case 'INSTALL_REDIS':
        case 'FLYWAY_MIGRATE_OUT_OF_ORDER':
        case 'FLYWAY_REPAIR_BEFORE_MIGRATION':
            return (
                <CheckboxField
                    className={styles.field}
                    name={name}
                    label={toTitleCase(name)}
                    value={defaultValue}
                    onChange={({ checked }) =>
                        onChange({ name, value: checked ? 'true' : 'false' })
                    }
                    required={required}
                    checked={defaultValue === 'true'}
                />
            )

        default:
            return (
                <InputField
                    className={styles.field}
                    name={name}
                    label={toTitleCase(name)}
                    value={defaultValue}
                    onChange={onChange}
                    required={required}
                />
            )
    }
}
