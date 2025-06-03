import { useField } from 'react-final-form'
import styles from '../styles.module.css'

export const TtlInput = ({ className }: { className?: string }) => {
    const { input, meta } = useField('ttl', {
        parse: (value) => (value ? Number(value) : undefined),
        format: (value) => (value ? String(value) : ''),
        validate: (value) => {
            if (value && (isNaN(value) || value < 0)) {
                return 'Please enter a valid non-negative number.'
            }
            return undefined
        },
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        input.onChange(event.target.value)
    }

    return (
        <div className={className}>
            <label className={styles.label}>Time to live (seconds)</label>
            <input
                {...input}
                type="text"
                onChange={handleChange}
                className={styles.inputField}
            />
            {meta.touched && meta.error && (
                <span className={styles.validationText}>{meta.error}</span>
            )}
        </div>
    )
}
