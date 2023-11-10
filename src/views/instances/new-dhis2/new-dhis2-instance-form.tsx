import { Button, ButtonStrip } from '@dhis2/ui'
import cx from 'classnames'
import { AnyObject } from 'final-form'
import { DescriptionTextarea } from './fields/description-textarea'
import { GroupSelect } from './fields/group-select'
import { NameInput } from './fields/name-input'
import { PublicCheckbox } from './fields/public-checkbox'
import { TtlSelect } from './fields/ttl-select'
import { ParameterFieldset } from './parameter-fieldset'
import styles from './styles.module.css'

type NewDhis2InstanceFormProps = {
    handleCancel: () => void
    handleSubmit: (event?: Partial<Pick<React.SyntheticEvent, 'preventDefault' | 'stopPropagation'>>) => Promise<AnyObject | undefined> | undefined
    submitting: boolean
    pristine: boolean
    invalid: boolean
}

export const NewDhis2InstanceForm = ({ handleCancel, handleSubmit, submitting, pristine, invalid }: NewDhis2InstanceFormProps) => (
    <form onSubmit={handleSubmit}>
        <fieldset className={cx(styles.fieldset, styles.main)}>
            <legend className={styles.legend}>Basic information</legend>
            <NameInput />
            <DescriptionTextarea />
            <TtlSelect />
            <GroupSelect />
            <PublicCheckbox />
        </fieldset>
        <hr className={styles.hr} />
        <ParameterFieldset />
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
