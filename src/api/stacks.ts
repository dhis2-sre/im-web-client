import axios from 'axios'
import { Stacks, Stack } from '../types/stack'
import { IM_HOST } from './index'

export const getStacks = (token) => {
    return axios.get<Stacks>('/stacks', {
        baseURL: IM_HOST,
        headers: {
            Authorization: token,
        },
    })
}

export const getStack = (token, { name }) => {
    return axios.get<Stack>('/stacks/' + name, {
        baseURL: IM_HOST,
        headers: {
            Authorization: token,
        },
    })
}
