import { AlertsProvider } from '@dhis2/app-service-alerts'
import { CssReset, CssVariables } from '@dhis2/ui'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/400-italic.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { Alerts, AuthProvider, ErrorView, Layout } from './components'
import './index.module.css'
import { DatabasesList, DeploymentDetails, InstancesList, NewDhis2Instance, RequestPasswordReset, ResetPassword, SignUp, StackDetails, StacksList } from './views'
import { UsersList } from './views/users'
import { GroupsList } from './views/groups'
import { Validate } from './views/validate'
import { UserDetails } from './views/users/user-details'

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

function render(tree) {
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

    if (process.env.REACT_APP_SUPRESS_STRICT_MODE) {
        return root.render(tree)
    }

    return root.render(
        <React.StrictMode>
            {tree}
        </React.StrictMode>
    )
}

render(
    <AlertsProvider>
        <CssReset />
        <CssVariables colors theme layers spacers elevations />
        <RouterProvider router={router} />
        <Alerts />
    </AlertsProvider>
)
