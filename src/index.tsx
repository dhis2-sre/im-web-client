import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from 'react-auth-kit'
import { createRoutesFromElements, Route } from 'react-router'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CssReset, CssVariables } from '@dhis2/ui'
import InstancesList from './components/InstancesLists'
import LoginPage from './components/Login'
import { API_HOST, refreshApi } from './api'
import { Layout } from './components/Layout'
import StackList from './components/Stacks'
import StackDetails from './components/Stack'
import { ErrorView } from './components/ErrorView'
import './index.module.css'
import { NewInstance } from './components/NewInstance'

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/login" element={<LoginPage />} />
            <Route errorElement={<ErrorView />} path="/" element={<Layout />}>
                <Route path="/stacks" element={<StackList />} />
                <Route path="/stacks/:name" element={<StackDetails />} />
                <Route path="/instances" element={<InstancesList />} />
                <Route path="/new" element={<NewInstance />} />
            </Route>
        </>
    )
)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <AuthProvider
            authType="localstorage"
            authName="_auth"
            cookieDomain={API_HOST}
            cookieSecure={true}
            refresh={refreshApi}
        >
            <CssReset />
            <CssVariables colors theme layers spacers elevations />
            <RouterProvider router={router} />
        </AuthProvider>
    </React.StrictMode>
)
