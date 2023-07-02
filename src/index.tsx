import { AlertsProvider } from '@dhis2/app-service-alerts'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from 'react-auth-kit'
import { createRoutesFromElements, Route, createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CssReset, CssVariables } from '@dhis2/ui'
import InstancesList from './components/InstancesLists'
import LoginPage from './components/Login'
import { API_URL, refreshApi } from './api'
import { Layout } from './components/Layout'
import StackList from './components/Stacks'
import StackDetails from './components/Stack'
import { ErrorView } from './components/ErrorView'
import './index.module.css'
import { NewInstance } from './components/NewInstance'
import SignUpPage from './components/SignUp'
import ListDatabases from './components/Databases/List'
import { Alerts } from './components/Alerts'

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/sign-up" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route errorElement={<ErrorView />} path="/" element={<Layout />}>
                <Route path="/stacks" element={<StackList />} />
                <Route path="/stacks/:name" element={<StackDetails />} />
                <Route path="/instances" element={<InstancesList />} />
                <Route path="/databases" element={<ListDatabases />} />
                <Route path="/new" element={<NewInstance />} />
            </Route>
        </>
    )
)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <AlertsProvider>
            <AuthProvider authType="localstorage" authName="_auth" cookieDomain={API_URL} cookieSecure={true} refresh={refreshApi}>
                <CssReset />
                <CssVariables colors theme layers spacers elevations />
                <RouterProvider router={router} />
                <Alerts />
            </AuthProvider>
        </AlertsProvider>
    </React.StrictMode>
)
