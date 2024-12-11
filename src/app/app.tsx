import { AlertsProvider } from '@dhis2/app-service-alerts'
import { CssReset, CssVariables } from '@dhis2/ui'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/400-italic.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { ReactElement } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { Alerts, AuthProvider, ErrorView, Layout, PublicLayout } from '../components/index.ts'
import {
    DatabasesList,
    DeploymentDetails,
    GroupsList,
    InstancesList,
    NewDhis2Instance,
    RequestPasswordReset,
    ResetPassword,
    SignUp,
    StackDetails,
    StacksList,
    UserDetails,
    UsersList,
    Validate,
    ValidateSuccess,
    NotFound,
} from '../views/index.ts'
import { InstancesTable } from '../views/public-instances/index.ts'

let routes: ReactElement
if (location.hostname === 'play.dhis2.org') {
    routes = (
        <Route element={<PublicLayout />}>
            <Route path="/" element={<InstancesTable />} />
        </Route>
    )
} else {
    routes = (
        <Route>
            <Route path="/public" element={<PublicLayout />}>
                <Route path="instances" element={<InstancesTable />} />
            </Route>
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/request-password-reset" element={<RequestPasswordReset />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/validate/success" element={<ValidateSuccess />} />
            <Route path="/validate/:token" element={<Validate />} />

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

            <Route path="*" element={<NotFound />} />
        </Route>
    )
}

const router = createBrowserRouter(createRoutesFromElements(routes))

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
