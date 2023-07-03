import axios from 'axios'
import { Stacks, Stack } from '../types/stack'
import { API_HOST } from './index'

export const getStacks = (token) => {
    return axios.get<Stacks>('/stacks', {
        baseURL: API_HOST,
        headers: {
            Authorization: token,
        },
    })
}

export const getStack = (token, name) => {
    return axios.get<Stack>('/stacks/' + name, {
        baseURL: API_HOST,
        headers: {
            Authorization: token,
        },
    })
}
