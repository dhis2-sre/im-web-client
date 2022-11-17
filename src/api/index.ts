import axios from 'axios'
import { createRefresh } from 'react-auth-kit'
import { InstancesGroup } from '../types'

export const API_HOST = process.env.REACT_APP_IM_API || 'https://api.im.dev.test.c.dhis2.org'

export const getInstances = (authHeader) => {
    return axios.get<InstancesGroup>('/instances', {
        baseURL: API_HOST,
        headers: {
            Authorization: authHeader,
        },
    })
}

export const deleteInstance = (token, id) => {
    return axios.delete('/instances/' + id, {
        baseURL: API_HOST,
        headers: {
            Authorization: token,
        },
    })
}

export const getToken = (username, password) => {
    return axios.post(
        `${API_HOST}/tokens`,
        {},
        {
            auth: {
                username,
                password,
            },
        }
    )
}

export const refreshApi = createRefresh({
    // TODO: this expiration value should read from the token... egg/chicken?
    interval: 14, // Refresh the token every 14 minutes
    refreshApiCallback: ({
        authToken,
        authTokenExpireAt,
        refreshToken,
        refreshTokenExpiresAt,
        authUserState,
    }) => {
        return axios
            .post(`${API_HOST}/refresh`, {
                refreshToken: refreshToken,
// TODO: no old auth token... https://api.im.dev.test.c.dhis2.org/users/docs#operation/refreshToken
//                oldAuthToken: authToken,
            })
            .then(({ data }) => {
                return {
                    isSuccess: true, // For successful network request isSuccess is true
                    newAuthToken: data.access_token,
                    newRefreshToken: data.refresh_token,
                    newAuthTokenExpireIn: data.expires_in,
                    // You can also add new refresh token ad new user state
                }
            })
            .catch((e) => {
                console.error(e)
                return {
                    isSuccess: false, // For unsuccessful network request isSuccess is false
                    newAuthToken: null,
                    newAuthTokenExpireIn: null,
                }
            })
    },
})
