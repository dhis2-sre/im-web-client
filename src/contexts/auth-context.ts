import { createContext } from 'react'
import type { User } from '../types'
import { AxiosError } from 'axios'

type AuthContextApi = {
    currentUser: User | null
    isAdministrator: boolean
    isAuthenticating: boolean
    isAuthenticated: () => boolean
    tokensRequestError: AxiosError | null
    login: (username: string, password: string, rememberMe: boolean) => Promise<void>
    logout: () => Promise<void>
}
const throwIfUninitialized = () => {
    throw new Error('Attempted to use `AuthContext` before initialization. Ensure the component is wrapped in an `AuthProvider`.')
}

export const AuthContext = createContext<AuthContextApi>({
    currentUser: null,
    isAdministrator: false,
    isAuthenticating: false,
    isAuthenticated: throwIfUninitialized,
    tokensRequestError: null,
    login: throwIfUninitialized,
    logout: throwIfUninitialized,
})
