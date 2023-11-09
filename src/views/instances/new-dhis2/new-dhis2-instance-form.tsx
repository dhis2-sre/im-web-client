import { Button, ButtonStrip, CheckboxFieldFF, TextAreaFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'
import { AnyObject } from 'final-form'
import { NameInput } from './name-input'
import { TtlSelect } from './ttl-select'
import { GroupSelect } from './group-select'
import { ParameterFieldSet } from './parameter-field-set'
import { converter } from './helpers'

type NewDhis2InstanceFormProps = {
    handleCancel: () => void
    handleSubmit: (event?: Partial<Pick<React.SyntheticEvent, 'preventDefault' | 'stopPropagation'>>) => Promise<AnyObject | undefined> | undefined
    submitting: boolean
    pristine: boolean
    invalid: boolean
}

export const NewDhis2InstanceForm = ({ handleCancel, handleSubmit, submitting, pristine, invalid }: NewDhis2InstanceFormProps) => (
    <form onSubmit={handleSubmit}>
        <fieldset>
            <legend>Basic information</legend>
            <NameInput />
            <Field name="description" label="Description" component={TextAreaFieldFF} />
            <TtlSelect />
            <GroupSelect />
            <Field type="checkbox" name="public" label="Make public" parse={converter.bool.parse} format={converter.bool.format} component={CheckboxFieldFF} />
        </fieldset>
        <ParameterFieldSet />
        <ButtonStrip>
            <Button primary disabled={submitting || pristine || invalid} loading={submitting} type="submit">
                Create instance
            </Button>
            <Button disabled={submitting} onClick={handleCancel}>
                Cancel
            </Button>
        </ButtonStrip>
    </form>
)
