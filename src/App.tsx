import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { router } from "./Router";
import { Toaster } from "./components/ui/toaster";

export default function App() {
    return (
        <ThemeProvider>
            <RouterProvider router={router} />
            <Toaster />
        </ThemeProvider>
    )
}
