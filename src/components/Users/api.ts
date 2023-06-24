import axios from 'axios'
import {API_HOST} from "../../api"
import {User} from "./types"

export const getUsers = (authHeader) => {
    return axios.get<User>('/users', {
        baseURL: API_HOST,
        headers: {Authorization: authHeader},
    })
}
