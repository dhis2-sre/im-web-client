import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import path from 'path'

const env = dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })
dotenvExpand.expand(env)

export const target = process.env.UI_HOSTNAME
export const username = process.env.USER_EMAIL
export const password = process.env.PASSWORD
