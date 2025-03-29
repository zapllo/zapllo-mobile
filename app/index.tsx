import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "~/redux/store";
import * as SecureStore from 'expo-secure-store';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                // Check if this is the first time launching the app
                const hasCompletedOnboarding = await SecureStore.getItemAsync('hasCompletedOnboarding');
                
                if (token) {
                    // User is authenticated, redirect to home
                    setRedirectPath("/(routes)/home");
                } else if (!hasCompletedOnboarding) {
                    // First time user, show onboarding
                    setRedirectPath("/(routes)/onboarding");
                } else {
                    // Not first time and no token, redirect to login
                    setRedirectPath("/(routes)/login");
                }
            } catch (error) {
                console.error("Error checking authentication status:", error);
                // Fallback to login on error for security
                setRedirectPath("/(routes)/login");
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, [token]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return redirectPath ? <Redirect href={redirectPath as any} /> : null;
}

