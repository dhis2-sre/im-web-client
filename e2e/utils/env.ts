import * as dotenv from 'dotenv'
import * as dotenvExpand from 'dotenv-expand'
import path from 'path'

const env = dotenv.config({ path: path.resolve(__dirname, '../../.env.local') })
dotenvExpand.expand(env)

export const username = process.env.IM_ADMIN_USER
export const password = process.env.IM_ADMIN_PASSWORD
