import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from 'react-auth-kit'
import { createRoutesFromElements, Route } from 'react-router'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { CssReset, CssVariables } from '@dhis2/ui'
import InstancesList from './components/Lists'
import LoginPage from './components/Login'
import { IM_HOST, refreshApi } from './api'
import './index.module.css'
import { Layout } from './components/Layout'
import StackList from "./components/Stacks";
import StackDetails from "./components/Stack";

const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout />}>
                <Route path="/stacks" element={<StackList />} />
                <Route path="/stacks/:name" element={<StackDetails />} />
                <Route path="/instances" element={<InstancesList />} />
                <Route path="/new" element={<h1>new</h1>} />
            </Route>
        </>
    )
)

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <AuthProvider
        authType="localstorage"
        authName="_auth"
        cookieDomain={IM_HOST}
        cookieSecure={true}
        refresh={refreshApi}
    >
        <React.StrictMode>
            <CssReset />
            <CssVariables colors theme layers spacers elevations />
            <RouterProvider router={router} />
        </React.StrictMode>
    </AuthProvider>
)
