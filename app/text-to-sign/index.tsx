import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, StyleSheet } from "react-native";
import { Formik } from "formik";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { FontAwesome } from "@expo/vector-icons";
import MyModule from "@/modules/my-module/src/MyModule";

interface Video {
    videoUrl: string;
    word: string;
}

export default function TextToSign() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [words, setWords] = useState<Video[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [text, setText] = useState("")
    const [language, setLanguage] = useState("")
    const [audioText, setAudioText] = useState("")
    const inputRef = useRef<null | TextInput>(null)

    useEffect(() => {
        const subscription = MyModule.addListener("onChange", (data) => {
            if (data.value !== undefined && data.value !== null && data.value !== "") {
                setAudioText(audioText + " " + data.value)
            }
        })
        return () => subscription.remove()
    }, [])

    useEffect(() => {
        setAudioText("")
        if (audioText) {
            fetchData(audioText)
        }
    }, [audioText])

    const fetchData = async (data: string) => {

        if (data.trim().length === 0) {
            setError("Please enter some text to convert");
            return;
        }
        setError(null);
        setWords([])
        setText("")
        setLanguage("")
        try {
            setIsSubmitting(true);
            const response = await axios.post(
                "https://text-to-sign-pwsl.onrender.com/get-videos",
                { signs: data },
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );
            setWords(response.data.videos);
            setText(response.data.text)
            setLanguage(response.data.language)
        } catch (error) {
            console.error("Error", error);
            setError("Failed to convert text. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
                <View style={styles.card}>
                    <Formik
                        initialValues={{ text: "" }}
                        onSubmit={(values) => fetchData(values.text)}
                    >
                        {({ values, handleChange, handleSubmit, handleReset, setFieldValue }) => {
                            useEffect(() => {
                                if (audioText) {
                                    setFieldValue("text", audioText.trim());
                                }
                            }, [audioText]);
                            return (
                                <>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputLabel}>Enter your text</Text>
                                        <View style={styles.inputAudio}>
                                            <TextInput
                                                value={values.text}
                                                onChangeText={handleChange("text")}
                                                multiline
                                                placeholder="Type something..."
                                                placeholderTextColor="#aaa"
                                                style={styles.textInput}
                                                ref={inputRef}
                                                autoFocus={true}
                                            />
                                            <FontAwesome
                                                style={styles.mic}
                                                onPress={async () => {
                                                    setAudioText("")
                                                    await MyModule.startRecording()
                                                }}
                                                name="microphone"
                                                size={28}
                                                color="#444"
                                            />
                                        </View>
                                        {error && <Text style={styles.errorText}>{error}</Text>}
                                    </View>

                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity
                                            onPress={() => handleSubmit()}
                                            disabled={isSubmitting}
                                            style={[
                                                styles.button,
                                                styles.convertButton,
                                            ]}
                                        >

                                            <Text style={styles.buttonText}>Convert</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={() => {
                                                handleReset();
                                                setWords([]);
                                                setAudioText("")
                                                setError(null);
                                            }}
                                            disabled={isSubmitting}
                                            style={[styles.button, styles.clearButton]}
                                        >
                                            <Text style={styles.buttonText}>Clear</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            )
                        }}
                    </Formik>
                </View>

                {isSubmitting && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0b00a3" />
                        <Text style={styles.loadingText}>Converting your text to sign language...</Text>
                    </View>
                )}

                {words.length > 0 && (
                    <View style={styles.resultCard}>
                        <VideoPlayer
                            words={words}
                            language={language}
                        />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 16,
        backgroundColor: "white"
    },
    card: {
        backgroundColor: "white",
        paddingHorizontal: 15
    },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#444",
        marginBottom: 4,
        paddingLeft: 4
    },
    inputAudio: {
        flex: 1,
        flexDirection: "row",
        position: "relative",
    },
    mic: {
        position: "absolute",
        right: 14,
        top: 10,
        zIndex: 10
    },
    textInput: {
        borderColor: "#e0e0e0",
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        fontSize: 16,
        backgroundColor: "#fafafa",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
        elevation: 1,
        paddingRight: 40,
        width: "100%",
        textAlignVertical: "top",
    },
    errorText: {
        color: "#d32f2f",
        marginTop: 8,
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 12,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    convertButton: {
        backgroundColor: "#4A56E2",
    },
    clearButton: {
        backgroundColor: "#4A56E2",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
    },
    loadingContainer: {
        alignItems: "center",
        marginTop: 30,
        marginBottom: 20,
    },
    loadingText: {
        marginTop: 12,
        color: "#666",
        fontSize: 15,
    },
    resultCard: {
        borderRadius: 12,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16,
        textAlign: "center",
    }
});