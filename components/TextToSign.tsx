import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, StyleSheet } from "react-native";
import { Formik } from "formik";
import axios from "axios";
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";

interface Video {
    videoUrl: string;
    word: string;
}

export default function TextToSign() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [words, setWords] = useState<Video[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [text, setText] = useState("")

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContainer}>
                <View style={styles.card}>
                    {/* <Text style={styles.title}>Text to Sign Language Converter</Text>
          <Text style={styles.subtitle}>Enter text below to convert to sign language videos</Text> */}

                    <Formik
                        initialValues={{ text: "" }}
                        onSubmit={async (values) => {
                            if (values.text.trim().length === 0) {
                                setError("Please enter some text to convert");
                                return;
                            }

                            setError(null);
                            try {
                                setIsSubmitting(true);
                                const response = await axios.post(
                                    "http://172.27.74.235:8001/get-videos",
                                    {
                                        signs: values.text,
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                    }
                                );
                                setWords(response.data.videos);
                                setText(response.data.text)
                            } catch (error) {
                                console.error("Error", error);
                                setError("Failed to convert text. Please try again.");
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                    >
                        {({ values, handleChange, handleSubmit, handleReset }) => (
                            <>
                                <View style={styles.inputContainer}>
                                    <Text style={styles.inputLabel}>Enter your text</Text>
                                    <TextInput
                                        value={values.text}
                                        onChangeText={handleChange("text")}
                                        multiline
                                        placeholder="Type here to convert to sign language..."
                                        placeholderTextColor="#aaa"
                                        style={styles.textInput}
                                    />
                                    {error && <Text style={styles.errorText}>{error}</Text>}
                                </View>

                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        onPress={() => handleSubmit()}
                                        disabled={isSubmitting}
                                        style={[
                                            styles.button,
                                            styles.convertButton,
                                            isSubmitting && styles.disabledButton,
                                        ]}
                                    >

                                        <Text style={styles.buttonText}>Convert</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => {
                                            handleReset();
                                            setWords([]);
                                            setError(null);
                                        }}
                                        disabled={isSubmitting}
                                        style={[styles.button, styles.clearButton]}
                                    >
                                        <Text style={styles.buttonText}>Clear</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
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
                        <View style={styles.resultTextContainer}>
                            <Text style={styles.result}>
                                Result:
                            </Text>
                            <Text style={styles.resultText}>
                                {text}
                            </Text>
                        </View>
                        {/* <Text style={styles.resultTitle}>Sign Language Videos</Text> */}
                        <VideoPlayer words={words} />
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor: "blue"
        // width: "100%"
        // backgroundColor: "#f5f5f5",
    },
    scrollContainer: {
        // padding: 16,
        // width: "100%"
    },
    card: {
        backgroundColor: "white",
        // borderRadius: 12,
        paddingHorizontal: 20
        // padding: 20,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 4,
    },
    //   title: {
    //     fontSize: 22,
    //     fontWeight: "700",
    //     color: "#333",
    //     marginBottom: 8,
    //     textAlign: "center",
    //   },
    //   subtitle: {
    //     fontSize: 14,
    //     color: "#666",
    //     marginBottom: 20,
    //     textAlign: "center",
    //   },
    inputContainer: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "500",
        color: "#444",
        marginBottom: 8,
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
        // minHeight: 60,
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
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    convertButton: {
        backgroundColor: "#4CAF50",
    },
    clearButton: {
        backgroundColor: "#f44336",
    },
    disabledButton: {
        backgroundColor: "#a5d6a7",
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
        // backgroundColor: "pink",
        borderRadius: 12,
        marginTop: 16,
        // padding: 20,
        // marginTop: 12,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.1,
        // shadowRadius: 8,
        // elevation: 4,
        // width: "100%"
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        marginBottom: 16,
        textAlign: "center",
    },
    resultTextContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 4
    },
    result: {
        fontSize: 14,
        fontWeight: 500,
        paddingLeft: 14
    },
    resultText: {
        fontSize: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 50,
        backgroundColor: "#d4f8fc",
        fontWeight: 500
    }
});