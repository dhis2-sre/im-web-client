import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { Options, UseAxiosResult, makeUseAxios } from 'axios-hooks'
import { useCallback } from 'react'
import { RefreshTokenRequest } from '../types'

export const baseURL = process.env.API_URL ?? process.env.REACT_APP_API_URL ?? 'https://dev.api.im.dhis2.org'

if (!baseURL) {
    throw new Error('No baseURL found. Ensure there is an environment variable called `REACT_APP_API_URL` present')
}

/* Better make sure this is a unque string because the event
 * is going to be sent via the global window object */
export const UNAUTHORIZED_EVENT = 'UNAUTHORIZED_EVENT_INSTANCE_MANAGER'

// Create an axios instance and we set the baseURL
const axiosInstance = axios.create({ baseURL, withCredentials: true })

type AxiosRequestConfigWithRetry = AxiosRequestConfig & {
    _retry: boolean
}

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config as AxiosRequestConfigWithRetry

        if (error.response.status === 401 && !config._retry) {
            try {
                // we use this flag to avoid retrying indefinitely if
                // getting a refresh token fails for any reason
                config._retry = true
                await axios.post<RefreshTokenRequest>('/refresh', null, {
                    baseURL,
                    withCredentials: true,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                })
                return axios(config)
            } catch (refreshError) {
                if (refreshError.response.status === 400) {
                    dispatchUnauthorizedEvent()
                }
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

const dispatchUnauthorizedEvent = () => {
    const event = new CustomEvent(UNAUTHORIZED_EVENT, { detail: window.location.pathname })
    window.dispatchEvent(event)
}

/* Produce a custom version of the `useAxios` hook
 * which uses the axios instance we've just created */
const useAxiosWithJwt = makeUseAxios({
    axios: axiosInstance,
    defaultOptions: {
        ssr: false,
    },
})

interface UseAuthAxiosOptions extends Options {
    autoCatch?: boolean
    withCredentials?: boolean
}

interface UseAuthAxios {
    <TResponse = any, TBody = any, TError = any>(config: AxiosRequestConfig<TBody> | string, options?: UseAuthAxiosOptions): UseAxiosResult<TResponse, TBody, TError>
}

const useAuthAxios: UseAuthAxios = (urlOrConfigObject, { autoCatch = false, withCredentials = true, ...options } = {}) => {
    const useAxiosResult: UseAxiosResult = useAxiosWithJwt(urlOrConfigObject, options)
    const [, execute] = useAxiosResult

    /* The default behaviour for useAxios is to let consumers deal
     * with promise rejection manually, but in some cases this is not
     * convenient. In cases where it is not ergonomic to have a try/catch
     * block in the component itself, the errors can be caught (swallowed)
     * in the hook by passing `autoCatch: true` in the options parameter. */
    const executeWithAutoCatch = useCallback(
        async (...args) => {
            try {
                return await execute(...args)
            } catch (error) {
                /* Only show the error on the browser console, but ensure
                 * the app does not crash. Assume the consumer will use
                 * the returned error object to display an error UI.  */
                console.error(error)
            }
        },
        [execute]
    )

    if (autoCatch) {
        useAxiosResult[1] = executeWithAutoCatch
    }
    return useAxiosResult
}

export { useAuthAxios }
