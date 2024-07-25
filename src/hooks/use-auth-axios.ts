import axios, { AxiosError } from 'axios'
import type { AxiosRequestConfig } from 'axios'
import { makeUseAxios } from 'axios-hooks'
import type { Options, UseAxiosResult } from 'axios-hooks'
import { useCallback } from 'react'
import { RefreshTokenRequest } from '../types/index.ts'

export const baseURL = import.meta.env.API_URL ?? import.meta.env.VITE_API_URL ?? 'https://dev.api.im.dhis2.org'

if (!baseURL) {
    throw new Error('No baseURL found. Ensure there is an environment variable called `VITE_API_URL` present')
}

/* Better make sure this is a unque string because the event
 * is going to be sent via the global window object */
export const UNAUTHORIZED_EVENT = 'UNAUTHORIZED_EVENT_INSTANCE_MANAGER'

const createAxiosInstance = () => axios.create({ baseURL, withCredentials: true })

// Create an axios instance and we set the baseURL
const axiosInstance = createAxiosInstance()

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        if (error.response?.status !== 401) {
            return Promise.reject(error)
        }

        try {
            await createAxiosInstance().post<RefreshTokenRequest>('/refresh', null, { headers: { 'Content-Type': 'application/json' } })

            return axios(error.config)
        } catch (refreshError) {
            dispatchUnauthorizedEvent()
            return Promise.reject(refreshError)
        }
    }
)

const dispatchUnauthorizedEvent = () => {
    const event = new CustomEvent(UNAUTHORIZED_EVENT)
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
}

interface UseAuthAxios {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <TResponse = any, TBody = any, TError = any>(config: AxiosRequestConfig<TBody> | string, options?: UseAuthAxiosOptions): UseAxiosResult<TResponse, TBody, TError>
}

const useAuthAxios: UseAuthAxios = (urlOrConfigObject, options = {}) => {
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

    if (options.autoCatch) {
        useAxiosResult[1] = executeWithAutoCatch
    }
    return useAxiosResult
}

export { useAuthAxios }
