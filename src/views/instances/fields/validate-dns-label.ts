/* DNS Label rfc1035 rules (https://www.ietf.org/rfc/rfc1035.txt):
 * The labels must follow the rules for ARPANET host names.  They must
 * start with a letter, end with a letter or digit, and have as interior
 * characters only letters, digits, and hyphen.  There are also some
 * restrictions on the length. Labels must be 63 characters or fewer. */
const startPattern = /^[a-z]$/
const endPattern = /^[a-z0-9]$/
const interiorPattern = /^[-a-z0-9]+$/
const maxLength = 63 - 'database-postgresql-0'.length

export const validateDnsLabel = (value = '') => {
    if (typeof value !== 'string') {
        throw new Error(`Name validator received a non-string type: "${typeof value}"`)
    }
    if (!value) {
        return 'Enter a name'
    }
    if (value.length > maxLength) {
        return `Use ${maxLength} characters or fewer`
    }
    if (!startPattern.test(value.charAt(0))) {
        return 'Name must start with a lowercase letter'
    }
    if (!endPattern.test(value.charAt(value.length - 1))) {
        return 'Name must end with a lowercase letter or a number'
    }
    if (!interiorPattern.test(value)) {
        return 'Use only lowercase letters, numbers and hyphens'
    }
    return undefined
}
