import { Stack } from "expo-router";

export default function RootLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false, statusBarStyle: "dark" }} />
			<Stack.Screen name="sign-to-text/index" options={{ title: "Sign to Text", statusBarStyle: "dark" }} />
			<Stack.Screen name="text-to-sign/index" options={{ title: "Text & Audio to Sign", statusBarStyle: "dark" }} />
		</Stack>
	);
}
