import { CheckboxFieldFF } from '@dhis2/ui'
import { Field } from 'react-final-form'

export const PublicCheckbox = () => <Field type="checkbox" name="public" label="Make public" component={CheckboxFieldFF} />
