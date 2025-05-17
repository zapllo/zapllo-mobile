import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/redux/store";
import * as SecureStore from 'expo-secure-store';
import { logIn } from '~/redux/slices/authSlice';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                console.log("Checking auth status...");
                
                // Check if this is the first time launching the app
                const hasCompletedOnboarding = await SecureStore.getItemAsync('hasCompletedOnboarding');
                
                // Check for stored token and user data in SecureStore
                const storedToken = await SecureStore.getItemAsync('authToken');
                const storedUserDataString = await SecureStore.getItemAsync('userData');
                
                console.log("Stored token exists:", !!storedToken);
                console.log("Stored user data exists:", !!storedUserDataString);
                console.log("Redux token exists:", !!token);
                console.log("Has completed onboarding:", hasCompletedOnboarding);
                
                // If we have a token and user data in SecureStore but not in Redux, restore them
                if (storedToken && storedUserDataString && !token) {
                    console.log("Restoring token and user data from SecureStore to Redux");
                    try {
                        const userData = JSON.parse(storedUserDataString);
                        dispatch(logIn({ token: storedToken, userData: userData }));
                    } catch (parseError) {
                        console.error("Error parsing stored user data:", parseError);
                    }
                }
                
                if (token || storedToken) {
                    // User is authenticated, redirect to home
                    console.log("Redirecting to home: token exists");
                    setRedirectPath("/(routes)/home");
                } else if (hasCompletedOnboarding ) {
                    // First time user, show onboarding
                    console.log("Redirecting to onboarding: first time user");
                    setRedirectPath("/(routes)/onboarding");
                } else {
                    // No token and has completed onboarding, go to login
                    console.log("Redirecting to login: no token");
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
    }, [token, dispatch]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ marginTop: 10 }}>Loading...</Text>
            </View>
        );
    }

    // Ensure we always have a redirect path to prevent blank screen
    const finalPath = redirectPath || "/(routes)/login";
    console.log("Final redirect path:", finalPath);
    return <Redirect href={finalPath as any} />;
}