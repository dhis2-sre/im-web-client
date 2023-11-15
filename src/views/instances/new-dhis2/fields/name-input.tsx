import { Field } from 'react-final-form'
import { InputFieldFF } from '@dhis2/ui'
import styles from './fields.module.css'

/* DNS Label rfc1035 rules (https://www.ietf.org/rfc/rfc1035.txt):
 * The labels must follow the rules for ARPANET host names.  They must
 * start with a letter, end with a letter or digit, and have as interior
 * characters only letters, digits, and hyphen.  There are also some
 * restrictions on the length. Labels must be 63 characters or less. */
const startPattern = /^[a-z]/
const endPattern = /[a-z0-9]$/
const interiorPattern = /[-a-z0-9]*/
const maxLenght = 63 - 'database-postgresql-0'.length

const validateDnsLabel = (value = '') => {
    if (typeof value !== 'string') {
        throw new Error(`Name validator received a non-string type: "${typeof value}"`)
    }
    if (!value) {
        return 'Name is required'
    }
    if (value.length > maxLenght) {
        return `Name can only contain ${maxLenght} characters`
    }
    if (!startPattern.test(value)) {
        return 'Name must start with a lowercase letter'
    }
    if (!endPattern.test(value)) {
        return 'Name must end with a lowercase letter or a number'
    }
    if (!interiorPattern.test(value)) {
        return 'Name can only contain lower case letter, numbers and hyphens'
    }
    return undefined
}

export const NameInput = () => (
    <Field helpText="Also used in the instance URL." className={styles.field} required name="name" label="Name" component={InputFieldFF} validate={validateDnsLabel} />
)
