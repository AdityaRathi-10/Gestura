import { useEffect, useState } from 'react';
import { Text, StyleSheet, View, Image, Animated } from 'react-native';

export default function SplashScreen() {
    const moveUp = useState(new Animated.Value(-50))[0];
    const opacity = useState(new Animated.Value(0))[0];
    const scale = useState(new Animated.Value(0.8))[0];

    useEffect(() => {
        Animated.sequence([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            }),
            Animated.parallel([
                Animated.timing(moveUp, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true
                }),
                Animated.timing(scale, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true
                })
            ])
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <Animated.View
                style={{
                    transform: [
                        { translateY: moveUp },
                        { scale: scale }
                    ],
                    opacity: opacity,
                    alignItems: "center"
                }}
            >
                <View style={styles.decorationLines} />
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>G E S T U R A</Text>
                </View>
                <View style={styles.decorationLines} />
                <View style={styles.logoContainer}>
                    <Image
                        source={require('./assets/logo.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                </View>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    titleContainer: {
        marginVertical: 20,
    },
    title: {
        fontSize: 52,
        fontWeight: 'bold',
        letterSpacing: 8,
        fontFamily: "System",
        color: "#333"
    },
    decorationLines: {
        height: 3,
        backgroundColor: 'darkorange',
        width: 280,
        borderRadius: 2,
        marginVertical: 5
    },
    logoContainer: {
        marginTop: 40,
        height: 120,
        width: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    }
});