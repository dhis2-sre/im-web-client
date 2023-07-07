import axios from 'axios'
import { Stacks, Stack } from '../types/stack'
import { API_URL } from './index'

export const getStacks = (token) => {
    return axios.get<Stacks>('/stacks', {
        baseURL: API_URL,
        headers: {
            Authorization: token,
        },
    })
}

export const getStack = (token, name) => {
    return axios.get<Stack>('/stacks/' + name, {
        baseURL: API_URL,
        headers: {
            Authorization: token,
        },
    })
}
