import { AlertsProvider } from '@dhis2/app-service-alerts'
import { CssReset, CssVariables } from '@dhis2/ui'
import React from 'react'
import { AuthProvider } from 'react-auth-kit'
import ReactDOM from 'react-dom/client'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router-dom'
import { API_URL, refreshApi } from './api'
import { Alerts, ErrorView, Layout } from './components'
import './index.module.css'
import { GroupedDatabasesList, InstancesList, Login, NewInstance, SignUp, StackDetails, StacksList } from './views'

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route errorElement={<ErrorView />} path="/" element={<Layout />}>
                <Route path="/stacks" element={<StacksList />} />
                <Route path="/stacks/:name" element={<StackDetails />} />
                <Route path="/instances" element={<InstancesList />} />
                <Route path="/databases" element={<GroupedDatabasesList />} />
                <Route path="/new" element={<NewInstance />} />
            </Route>
        </>
    )
)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <AlertsProvider>
            <AuthProvider
                authType="localstorage"
                authName="_auth"
                cookieDomain={API_URL}
                cookieSecure={true}
                refresh={refreshApi}
            >
                <CssReset />
                <CssVariables colors theme layers spacers elevations />
                <RouterProvider router={router} />
                <Alerts />
            </AuthProvider>
        </AlertsProvider>
    </React.StrictMode>
)
