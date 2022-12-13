import {InputField, SingleSelect, SingleSelectOption} from '@dhis2/ui'
import {useApi} from "../api/useApi"
import {Integrations} from "../types"
import {getIntegration} from "../api/integrations"

export const StackParameter = (props) => {
    if (props.name === "DATABASE_ID") {
        return StackParameterDatabaseId(props)
    } else {
        return StackParameterDefault(props)
    }
}

export const StackParameterDefault = (props) => {
    const onChange = (value) => {
        return props.onChange(props.name, value)
    }

    return (
        <InputField
            className={props.className}
            key={props.name}
            name={props.name}
            label={props.label}
            value={props.value}
            onChange={onChange}
            required
        />
    )
}

const StackParameterDatabaseId = (props) => {
    const key = "DATABASE_ID"

    const {
        result,
        isLoading,
    } = useApi<Integrations>(getIntegration, {key: key})

    if (isLoading) {
        return null
    }

    const onChange = (value) => props.onChange(key, value)

    return (
        <div>
            <span>{props.label}</span>
            <SingleSelect name={key} className={props.className} onChange={onChange}>
                {Object.entries(result).map((value, index) => (
                    <SingleSelectOption key={value.at(0)} value={value.at(0)} label={value.at(1)} />
                ))}
            </SingleSelect>
        </div>
    )
}
