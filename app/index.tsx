import React, { Suspense, useEffect } from "react";
import { Link } from "expo-router";
import { Pressable, Text, View, StatusBar, StyleSheet, Image, Animated, ActivityIndicator, SafeAreaView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
	const insets = useSafeAreaInsets();
	const fadeAnim = new Animated.Value(0);
	const slideUpAnim = new Animated.Value(50);
	const scaleAnim = new Animated.Value(0.9);

	useEffect(() => {
		Animated.parallel([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true,
			}),
			Animated.timing(slideUpAnim, {
				toValue: 0,
				duration: 800,
				useNativeDriver: true,
			}),
			Animated.spring(scaleAnim, {
				toValue: 1,
				friction: 8,
				tension: 40,
				useNativeDriver: true,
			})
		]).start();
	}, []);

	const handlePressIn = () => {
		Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
	};

	return (
		<View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
			<StatusBar barStyle={"dark-content"} />

			<Animated.View
				style={[
					styles.logoContainer,
					{ opacity: fadeAnim }
				]}
			>
				<Text style={styles.logo}>Breaking barriers through signs...</Text>
			</Animated.View>

			<Animated.View
				style={[
					styles.illustrationContainer,
					{
						opacity: fadeAnim,
						transform: [{ scale: scaleAnim }],
					}
				]}
			>
				<Image
					source={require('@/assets/images/hand-wave.png')}
					style={styles.illustration}
					resizeMode="contain"
				/>
			</Animated.View>

			<Animated.View
				style={[
					styles.buttonContainer,
					{
						opacity: fadeAnim,
						transform: [{ translateY: slideUpAnim }]
					}
				]}
			>
				<Suspense fallback={<ActivityIndicator size={"large"} color={"#0000ff"} />}>
					<Pressable
						style={({ pressed }) => [
							styles.button,
							styles.signToTextButton,
							pressed && styles.buttonPressed
						]}
						onPressIn={handlePressIn}
						android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
					>
						<MaterialCommunityIcons name="gesture-two-double-tap" size={28} color="white" />
						<Link href={"/sign-to-text"} style={styles.buttonTextContainer}>
							<View>
								<Text style={styles.buttonText}>Sign to Text</Text>
							</View>
							<View>
								<Text style={styles.buttonSubText}>Translate gestures to written words</Text>
							</View>
						</Link>
						<Ionicons name="chevron-forward" size={24} color="white" style={styles.arrowIcon} />
					</Pressable>
				</Suspense>

				<Suspense fallback={<ActivityIndicator size={"large"} color={"#0000ff"} />}>
					<Pressable
						style={({ pressed }) => [
							styles.button,
							styles.textToSignButton,
							pressed && styles.buttonPressed
						]}
						onPressIn={handlePressIn}
						android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: false }}
					>
						<Ionicons name="text" size={28} color="white" />
						<Link href={"/text-to-sign"} style={styles.buttonTextContainer}>
							<View>
								<Text style={styles.buttonText}>Text & Audio to Sign</Text>
							</View>
							<View>
								<Text style={styles.buttonSubText}>Convert words to visual sign language</Text>
							</View>
						</Link>
						<Ionicons name="chevron-forward" size={24} color="white" style={styles.arrowIcon} />
					</Pressable>
				</Suspense>
			</Animated.View>

			<Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
				<Text style={styles.footerText}>Making communication accessible for everyone</Text>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
		paddingHorizontal: 24,
	},
	logoContainer: {
		marginTop: 20,
		alignItems: "center",
	},
	logo: {
		fontSize: 26,
		fontWeight: "bold",
		color: "#4A56E2",
		letterSpacing: 1,
		textAlign: "center"
	},
	lottieAnimation: {
		width: 70,
		height: 70,
		marginLeft: 5,
	},
	illustrationContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 30,
		flex: 1,
	},
	illustration: {
		width: "80%",
		maxHeight: 240,
	},
	buttonContainer: {
		marginBottom: 40,
		gap: 16,
	},
	button: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 16,
		paddingHorizontal: 20,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 5,
	},
	buttonPressed: {
		transform: [{ scale: 0.98 }],
		opacity: 0.9,
	},
	signToTextButton: {
		backgroundColor: "#4A56E2",
	},
	textToSignButton: {
		backgroundColor: "#6C63FF",
	},
	buttonTextContainer: {
		flex: 1,
		marginLeft: 16,
	},
	buttonText: {
		color: "white",
		fontSize: 18,
		fontWeight: "700",
	},
	buttonSubText: {
		color: "rgba(255, 255, 255, 0.85)",
		fontSize: 13,
		marginTop: 4,
	},
	arrowIcon: {
		marginLeft: 10,
	},
	footer: {
		alignItems: "center",
		marginBottom: 16,
	},
	footerText: {
		color: "#999",
		fontSize: 14,
		textAlign: "center"
	}
});