import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

import AdminPage from "./AdminPage";
import KioskPage from "./KioskPage";
import QueuePage from "./QueuePage";
import RefereePage from "./RefereePage";

TimeAgo.addDefaultLocale(en);

const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminPage />,
  },
  //   {
  //     path: "kiosk",
  //     element: <KioskPage />,
  //   },
  //   {
  //     path: "queue",
  //     element: <QueuePage />,
  //   },
  {
    path: "/",
    element: <RefereePage />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
