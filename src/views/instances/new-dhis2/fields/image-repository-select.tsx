import { SingleSelectField, hasValue } from '@dhis2/ui'
import cx from 'classnames'
import { FC, useMemo } from 'react'
import { useAuthAxios } from '../../../../hooks'
import { useField } from 'react-final-form'
import { IMAGE_REPOSITORY } from '../constants'
import styles from './fields.module.css'

type CustomOption = {
    value: string
    primaryText: string
    secondaryText: string
}

export const IMAGE_REPOSITORY_FIELD_NAME = `dhis2-core.${IMAGE_REPOSITORY}`
const predefinedOptions = new Map<string, CustomOption>([
    [
        'core',
        {
            value: 'core',
            primaryText: 'Stable',
            secondaryText: 'Reliable, tested versions for production',
        },
    ],
    [
        'core-canary',
        {
            value: 'core-canary',
            primaryText: 'Canary',
            secondaryText: 'Early access to new features',
        },
    ],
    [
        'core-dev',
        {
            value: 'core-dev',
            primaryText: 'Development',
            secondaryText: 'Cutting-edge updates',
        },
    ],
    [
        'core-pr',
        {
            value: 'core-pr',
            primaryText: 'PR',
            secondaryText: 'Test specific code changes',
        },
    ],
])

const CustomSelectOption: FC<{
    label: string
    secondaryText: string
    value: string
    active?: boolean
    onClick?: (payload: {}, event: React.SyntheticEvent) => void
}> = ({ label, secondaryText, active, onClick, value }) => (
    <div
        className={cx(styles.customOption, {
            [styles.active]: active,
        })}
        onClick={(e) => onClick({}, e)}
        data-value={value}
        data-label={label}
    >
        <div>{label}</div>
        <div className={styles.secondaryText}>{secondaryText}</div>
    </div>
)

export const ImageRepositorySelect: FC<{ displayName: string }> = ({ displayName }) => {
    const { meta, input } = useField(IMAGE_REPOSITORY_FIELD_NAME, {
        validate: hasValue,
    })
    const [{ data, error, loading }] = useAuthAxios({
        url: '/integrations',
        method: 'POST',
        data: {
            key: IMAGE_REPOSITORY,
            payload: {
                organization: 'dhis2',
            },
        },
    })
    const options = useMemo<CustomOption[]>(() => {
        if (!data) {
            if (meta.initial) {
                return [predefinedOptions.get(meta.initial as string) ?? { value: meta.initial, primaryText: meta.initial, secondaryText: '' }]
            } else {
                return []
            }
        }

        return data.filter((value: string) => value.startsWith('core') && predefinedOptions.has(value)).map((value: string) => predefinedOptions.get(value))
    }, [data, meta.initial])

    const hasErrorState = error || (meta.touched && meta.invalid)
    const errorMessage = hasErrorState ? error?.message ?? meta.error : ''

    return (
        <SingleSelectField
            label={displayName}
            error={!!hasErrorState}
            loading={loading}
            validationText={errorMessage}
            onChange={({ selected }) => {
                input.onChange(selected)
            }}
            selected={input.value as string}
            required
        >
            {options.map((option) => (
                <CustomSelectOption key={option.value} value={option.value} label={option.primaryText} secondaryText={option.secondaryText} />
            ))}
        </SingleSelectField>
    )
}
