export const username = process.env.USER_EMAIL
export const password = process.env.USER_PASSWORD

export const targetGroup = process.env.TARGET_GROUP || 'whoami'
export const dhis2CoreImageTag = process.env.DHIS2_CORE_IMAGE_TAG || '42'
export const dhis2CoreUpdateImageTag = process.env.DHIS2_CORE_UPDATE_IMAGE_TAG || '42.0.0'
