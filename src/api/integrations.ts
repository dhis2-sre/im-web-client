import axios from 'axios'
import {API_HOST} from './index'
import {Integrations} from "../types"

export const getIntegration = (token, {key, payload}) => {
    return axios.post<Integrations>('/integrations', {key: key, payload: payload}, {
        baseURL: API_HOST,
        headers: {
            Authorization: token,
        }
    })
}
