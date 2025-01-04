import { createBrowserRouter } from "react-router-dom";

import { Applayout } from "./components/layouts/AppLayout";

import NoMatch from "./pages/NoMatch";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Images from "./pages/Images";
import Products from "./pages/Products";
import Variations from "./pages/Variations";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Applayout />,
        children: [
            {
                path: "",
                element: <Dashboard />,
            },
            {
                path: "products",
                element: <Products />,
            },
            {
                path: "categories",
                element: <Categories />,
            },
            {
                path: "variations",
                element: <Variations />,
            },
            {
                path: "images",
                element: <Images />,
            },
        ],
    },
    {
        path: "*",
        element: <NoMatch />,
    },
])
