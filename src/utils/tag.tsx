import {
    IconMore16,
    IconError16,
    IconClockHistory16,
    IconCheckmarkCircle16
} from '@dhis2/ui';

/**
 * Returns the appropriate Tag props based on the instance status
 * @param {string} status - The status of the instance
 * @returns {object} The props to be passed to the Tag component
 */
export const getTagProps = (status: string) => {
    if (!status) return {};
    if (status.startsWith('Booting') || status === 'Pending') {
        return { neutral: true, icon: <IconClockHistory16 /> };
    }
    
    if (status === 'Error') {
        return { negative: true, icon: <IconError16 /> };
    }
    
    if (status === 'Running') {
        return { positive: true, icon: <IconCheckmarkCircle16 /> };
    }
    
    return { icon: <IconMore16 /> };
};
