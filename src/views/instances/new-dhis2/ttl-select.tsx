import { SingleSelectFieldFF, hasValue } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { converter } from './helpers'

const defaultTTL = 60 * 60 * 24
const options: { label: string; value: string }[] = [
    { label: '1 hour', value: (60 * 60).toString() },
    { label: '6 hours', value: (60 * 60 * 6).toString() },
    { label: '12 hours', value: (60 * 60 * 12).toString() },
    { label: '1 day', value: defaultTTL.toString() },
    { label: '2 days', value: (60 * 60 * 24 * 2).toString() },
    { label: '5 days', value: (60 * 60 * 24 * 5).toString() },
    { label: '1 week', value: (60 * 60 * 24 * 7).toString() },
    { label: '2 weeks', value: (60 * 60 * 24 * 7 * 2).toString() },
    { label: '1 month', value: (60 * 60 * 24 * 7 * 4).toString() },
]

export const TtlSelect = () => (
    <Field
        parse={converter.integer.parse}
        format={converter.integer.format}
        required
        name="ttl"
        label="Lifetime"
        component={SingleSelectFieldFF}
        options={options}
        initialValue={defaultTTL}
        validate={hasValue}
    />
)
