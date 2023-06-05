import axios from 'axios'
import { createRefresh } from 'react-auth-kit'
import {GroupWithDatabases, InstancesGroup} from '../types'
import { parseToken } from '../modules'

export const API_HOST = process.env.REACT_APP_IM_API || 'https://api.im.dev.test.c.dhis2.org'

export const getDatabases = (authHeader) => {
    return axios.get<GroupWithDatabases>('/databases', {
        baseURL: API_HOST,
        headers: {
            Authorization: authHeader,
        },
    })
}

export const postDatabase = (authHeader, formData) => {
    return axios.post<GroupWithDatabases>('/databases', formData,{
        baseURL: API_HOST,
        headers: {
            Authorization: authHeader,
        },
    })
}

export const deleteDatabase = (authHeader, id) => {
    return axios.delete('/databases/' + id, {
        baseURL: API_HOST,
        headers: {
            Authorization: authHeader,
        },
    })
}

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

export const postSignUp = (username, password) => {
    return axios.post(
        `${API_HOST}/users`,
        {
            email: username,
            password: password,
        },
    )
}

const getRefreshIntervalFromLocalStorage = () => {
    const refreshToken = localStorage.getItem('_auth_refresh')

    if (!refreshToken) {
        /* This will happen when a user first visits the app,
         * or after clearing the local storage. It will cause the
         * app to refetch a refresh token every 14 minutes, which
         * currently is the correct value, see:
         * https://github.com/dhis2-sre/im-manager/blob/master/helm/chart/values.yaml#L6
         * But it would be nicer if this could be tackled in a
         * different way so that we can always infer the refresh
         * interval duration on the refresh token itself. See:
         * https://github.com/react-auth-kit/react-auth-kit/issues/1336 */
        console.error(
            'Tried to read refresh token expiry from local storage but found no token'
        )
        return 14
    }

    const { expiryDurationInMinutes } = parseToken(refreshToken)

    return expiryDurationInMinutes
}

export const refreshApi = createRefresh({
    interval: getRefreshIntervalFromLocalStorage(),
    refreshApiCallback: ({ refreshToken }) => {
        return axios
<<<<<<< HEAD
            .post(`${API_HOST}/refresh`, { refreshToken })
=======
            .post(`${API_HOST}/refresh`, {
                refreshToken: refreshToken,
                // TODO: no old auth token... https://api.im.prod.test.c.dhis2.org/users/docs#operation/refreshToken
                //                oldAuthToken: authToken,
            })
>>>>>>> 5d9bba8 (chore: update config variables)
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
