/**
 * Returns the appropriate Tag props based on the instance status
 * @param {string} status - The status of the instance
 * @returns {object} The props to be passed to the Tag component
 */
export const getTagProps = (status) => {
    if (!status) return {}
    if (status.startsWith('Booting') || status === 'Pending') {
        return { neutral: true }
    } else if (status === 'Error') {
        return { negative: true }
    } else if (status === 'Running') {
        return { positive: true }
    } else {
        return {}
    }
}
