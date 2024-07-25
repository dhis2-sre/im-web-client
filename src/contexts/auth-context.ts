import { createContext } from 'react'
import type { User } from '../types'

type AuthContextApi = {
    currentUser: User | null
    isAdministrator: boolean
    isAuthenticating: boolean
    authenticationErrorMessage: string
    login: (username: string, password: string) => Promise<void>
    googleLogin: () => Promise<void>
    logout: () => Promise<void>
}
const throwIfUninitialized = () => {
    throw new Error('Attempted to use `AuthContext` before initialization. Ensure the component is wrapped in an `AuthProvider`.')
}

export const AuthContext = createContext<AuthContextApi>({
    currentUser: null,
    isAdministrator: false,
    isAuthenticating: false,
    authenticationErrorMessage: '',
    login: throwIfUninitialized,
    googleLogin: throwIfUninitialized(),
    logout: throwIfUninitialized
})
