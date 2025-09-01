import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "~/redux/store";
import { logIn } from '~/redux/slices/authSlice';
import TokenStorage from '~/utils/tokenStorage';

export default function Index() {
    const [isLoading, setIsLoading] = useState(true);
    const [redirectPath, setRedirectPath] = useState<string | null>(null);
    const { token } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                console.log("Checking auth status...");
                
                // Check if this is the first time launching the app using TokenStorage
                const hasCompletedOnboarding = await TokenStorage.hasCompletedOnboarding();
                
                // Check for stored token and user data using TokenStorage
                const { token: storedToken, userData: storedUserData } = await TokenStorage.getAuthData();
                
                console.log("Stored token exists:", !!storedToken);
                console.log("Stored user data exists:", !!storedUserData);
                console.log("Redux token exists:", !!token);
                console.log("Has completed onboarding:", hasCompletedOnboarding);
                
                // If we have auth data in storage but not in Redux, restore them
                if (storedToken && storedUserData && !token) {
                    console.log("Restoring token and user data from AsyncStorage to Redux");
                    dispatch(logIn({ token: storedToken, userData: storedUserData }));
                }
                
                if (token || storedToken) {
                    // User is authenticated, redirect to home
                    console.log("Redirecting to home: token exists");
                    setRedirectPath("/(routes)/home");
                } else if (!hasCompletedOnboarding) {
                    // First time user, show onboarding
                    console.log("Redirecting to onboarding: first time user");
                    setRedirectPath("/(routes)/onboarding");
                } else {
                    // No token and has completed onboarding, go to login
                    console.log("Redirecting to login: no token");
                    setRedirectPath("/(routes)/login");
                }
                
                // Debug: Print auth data for troubleshooting
                await TokenStorage.debugPrintAuthData();
                
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