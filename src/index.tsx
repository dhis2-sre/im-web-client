import React from "react";
import ReactDOM from "react-dom/client";

import { createRoutesFromElements, Route } from "react-router";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import InstancesList from "./components/Lists";
import LoginPage from "./components/Login";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/">
      <Route path="/" element={<LoginPage />} />
      <Route path="/instances" element={<InstancesList />} />
    </Route>
  )
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
