import axios from 'axios'
import { createRefresh } from 'react-auth-kit'
import { InstancesGroup } from '../types'
import { parseToken } from '../modules'

export const API_HOST =
    process.env.REACT_APP_IM_API || 'https://api.im.dev.test.c.dhis2.org'

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

const getRefreshIntervalFromLocalStorage = () => {
    const refreshToken = localStorage.getItem('_auth_refresh')

    if (!refreshToken) {
        throw new Error(
            'Tried to read refresh token expiry from local storage but found no token'
        )
    }

    const { expiryDurationInMinutes } = parseToken(refreshToken)

    return expiryDurationInMinutes
}

export const refreshApi = createRefresh({
    interval: getRefreshIntervalFromLocalStorage(),
    refreshApiCallback: ({ refreshToken }) => {
        return axios
            .post(`${API_HOST}/refresh`, { refreshToken })
            .then(({ data }) => {
                const {
                    expiryDurationInMinutes: newAuthTokenExpireIn,
                    user: newAuthUserState,
                } = parseToken(data.access_token)
                const { expiryDurationInMinutes: newRefreshTokenExpiresIn } =
                    parseToken(data.refresh_token)

                return {
                    isSuccess: true, // For successful network request isSuccess is true
                    newAuthToken: data.access_token,
                    newAuthTokenExpireIn,
                    newRefreshToken: data.refresh_token,
                    newRefreshTokenExpiresIn,
                    newAuthUserState,
                }
            })
            .catch((error) => {
                console.error('Could not refresh access token', error)
                return {
                    isSuccess: false, // For successful network request isSuccess is true
                    newAuthToken: null,
                    newAuthTokenExpireIn: null,
                    newRefreshToken: null,
                    newRefreshTokenExpiresIn: null,
                    newAuthUserState: null,
                }
            })
    },
})
