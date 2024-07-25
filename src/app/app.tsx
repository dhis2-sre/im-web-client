import { AlertsProvider } from '@dhis2/app-service-alerts'
import { CssReset, CssVariables } from '@dhis2/ui'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/400-italic.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { Alerts, AuthProvider, ErrorView, Layout } from '../components/index.ts'
import {
    DatabasesList,
    DeploymentDetails,
    InstancesList,
    NewDhis2Instance,
    RequestPasswordReset,
    ResetPassword,
    SignUp,
    StackDetails,
    StacksList,
    GroupsList,
    UsersList,
    UserDetails,
    Validate,
} from '../views/index.ts'

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route>
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/validate/:token" element={<Validate />} />
            <Route path="/request-password-reset" element={<RequestPasswordReset />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route element={<AuthProvider />}>
                <Route errorElement={<ErrorView />} path="/" element={<Layout />}>
                    <Route path="/stacks" element={<StacksList />} />
                    <Route path="/stacks/:name" element={<StackDetails />} />
                    <Route path="/instances" element={<InstancesList />} />
                    <Route path="/databases" element={<DatabasesList />} />
                    <Route path="/instances/new" element={<NewDhis2Instance />} />
                    <Route path="/instances/:id/details" element={<DeploymentDetails />} />
                    <Route path="/groups" element={<GroupsList />} />
                    <Route path="/users" element={<UsersList />} />
                    <Route path="/users/:id" element={<UserDetails />} />
                </Route>
            </Route>
        </Route>
    )
)

export const App = () => (
    <AlertsProvider
        plugin={false}
        // eslint-disable-next-line @typescript-eslint/ban-types
        parentAlertsAdd={undefined as Function}
        showAlertsInPlugin={false}
    >
        <CssReset />
        <CssVariables colors theme layers spacers elevations />
        <RouterProvider router={router} />
        <Alerts />
    </AlertsProvider>
)
