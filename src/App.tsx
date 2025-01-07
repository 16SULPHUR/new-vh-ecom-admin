import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { router } from "./Router";
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./lib/auth-context";
import RouterWrapper from "./RouterWrapper";

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
            <RouterWrapper/>
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
    )
}
