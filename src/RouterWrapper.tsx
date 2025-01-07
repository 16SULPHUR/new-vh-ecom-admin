import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { router } from "./Router";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { LoginForm } from "./components/login-form";


export default function RouterWrapper() {

    const { user } = useAuth()


    if (!user) {
        return (
            <Card className="w-full max-w-md mx-auto mt-8">
                <CardHeader>
                <img src="https://media.varietyheaven.in/images/BRANDING/VH%20LOGO%20WHT.svg" alt="LOGO" />
                    <CardTitle>Log in to access the Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <LoginForm />
                </CardContent>
            </Card>
        )
    }


    return (
        <RouterProvider router={router} />
    )
}
