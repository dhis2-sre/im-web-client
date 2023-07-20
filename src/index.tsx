import { AlertsProvider } from '@dhis2/app-service-alerts'
import { CssReset, CssVariables } from '@dhis2/ui'
import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import { Alerts, ErrorView, Layout } from './components'
import './index.module.css'
import { DatabasesList, InstancesList, Login, NewInstance, SignUp, StackDetails, StacksList } from './views'
import { UsersList } from './views/users'
import { GroupsList } from './views/groups'
import { CurrentUserContext, getCurrentUser } from './hooks/current-user'

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route errorElement={<ErrorView />} path="/" element={<Layout />}>
                <Route path="/stacks" element={<StacksList />} />
                <Route path="/stacks/:name" element={<StackDetails />} />
                <Route path="/instances" element={<InstancesList />} />
                <Route path="/databases" element={<DatabasesList />} />
                <Route path="/new" element={<NewInstance />} />
                <Route path="/groups" element={<GroupsList />} />
                <Route path="/users" element={<UsersList />} />
            </Route>
        </>
    )
)

const currentUser = getCurrentUser()
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <React.StrictMode>
        <AlertsProvider>
            <CurrentUserContext.Provider value={{ currentUser }}>
                <CssReset />
                <CssVariables colors theme layers spacers elevations />
                <RouterProvider router={router} />
                <Alerts />
            </CurrentUserContext.Provider>
        </AlertsProvider>
    </React.StrictMode>
)
