import axios from 'axios'
import { API_HOST } from './index'

export const getIntergrations = (
    token,
    options: {
        key: string
        repository?: string
        organization?: string
    }
) => {
    return axios.post<any>('/integrations', options, {
        baseURL: API_HOST,
        headers: {
            Authorization: token,
        },
    })
}
