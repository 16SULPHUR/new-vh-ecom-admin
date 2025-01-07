import { createBrowserRouter } from "react-router-dom";

import { Applayout } from "./components/layouts/AppLayout";

import NoMatch from "./pages/NoMatch";
import Categories from "./pages/Categories";
import Images from "./pages/Images";
import Products from "./pages/Products";
import Variations from "./pages/Variations";
import Collections from "./pages/Collections";
import { AddProducts } from "./pages/AddProduct";
import { ProductDashboard } from "./pages/Dashboard";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Applayout />,
        children: [
            {
                path: "",
                element: <ProductDashboard />,
            },
            {
                path: "products",
                element: <Products />,
            },
            {
                path: "add-product",
                element: <AddProducts />,
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
            {
                path: "collections",
                element: <Collections />,
            },
        ],
    },
    {
        path: "*",
        element: <NoMatch />,
    },
])

