import {InputField, SingleSelect, SingleSelectField, SingleSelectOption} from '@dhis2/ui'
import {useApi} from "../api/useApi"
import {Integrations} from "../types"
import {getIntegration} from "../api/integrations"

export const StackParameter = (props) => {
    if (props.name === "IMAGE_REPOSITORY") {
        return StackParameterImageRepository(props)
    } else if (props.name === "IMAGE_TAG") {
        return StackParameterImageTag(props)
    } else if (props.name === "PRESET_ID") {
        return StackParameterPresetId(props)
    } else if (props.name === "SOURCE_ID") {
        return StackParameterSourceId(props)
    } else if (props.name === "DATABASE_ID") {
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

export const StackParameterImageRepository = (props) => {
    const key = "IMAGE_REPOSITORY"

    const {
        result,
        isLoading,
    } = useApi<Integrations>(getIntegration, {key: key, payload: {organization: "dhis2"}})

    if (isLoading) {
        return null
    }

    const onChange = (value) => {
        return props.onChange(key, value)
    }

    return (
        <div>
            <span>Image repo</span>
            <SingleSelectField name={key} className={props.className} onChange={onChange} selected="1">
                {Object.entries(result).map((value) => (
                    <SingleSelectOption value={value.at(0)} label={value.at(1)} />
                ))}
            </SingleSelectField>
        </div>
    )
}

export const StackParameterImageTag = (props) => {
    const key = "IMAGE_TAG"

    let repository = "core"

    if (props.optionalStackParameters) {
//        repository = Object.keys(props.optionalStackParameters).find(k => props.optionalStackParameters[k] === "IMAGE_REPOSITORY")
    }

    const {
        result,
        isLoading,
    } = useApi<Integrations>(getIntegration, {key: key, payload: {organization: "dhis2", repository: repository}})

    if (isLoading) {
        return null
    }

    const onChange = (value) => {
        return props.onChange(key, value)
    }

    return (
        <div>
            <span>Image tag</span>
            <SingleSelectField name={key} className={props.className} onChange={onChange} selected="1">
                {Object.entries(result).map((value) => (
                    <SingleSelectOption value={value.at(0)} label={value.at(1)} />
                ))}
            </SingleSelectField>
        </div>
    )
}

export const StackParameterDatabaseId = (props) => {
    const key = "DATABASE_ID"
    return StackParameterNoPayload(props, key)
}

export const StackParameterPresetId = (props) => {
    const key = "PRESET_ID"
    return StackParameterNoPayload(props, key)
}

export const StackParameterSourceId = (props) => {
    const key = "SOURCE_ID"
    return StackParameterNoPayload(props, key)
}

const StackParameterNoPayload = (props, key) => {
    const {
        result,
        isLoading,
    } = useApi<Integrations>(getIntegration, {key: key})

    if (isLoading) {
        return null
    }

    const onChange = (value) => {
      return props.onChange(key, value)
    }

    return (
        <div>
            <span>{key}</span>
            <SingleSelect name={key} className={props.className} onChange={onChange}>
                {Object.entries(result).map((value, index) => (
                    <SingleSelectOption value={value.at(0)} label={value.at(1)} />
                ))}
            </SingleSelect>
        </div>
    )
}
