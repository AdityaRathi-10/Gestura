import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Video from 'react-native-video';
import { Ionicons } from '@expo/vector-icons';
import { speak } from "expo-speech"
import languageCountryMapping from "@/assets/languages.json"

interface VideoItem {
    videoUrl: string,
    word: string
}

export default function VideoPlayer({ words, language }: { words: VideoItem[], language: string }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [paused, setPaused] = useState(false);
    const [languageMappings, setLanguageMappings] = useState<null | any>(null)

    useEffect(() => {
        setLanguageMappings(languageCountryMapping)
    }, [])

    const handleEnd = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const goToNext = () => {
        if (currentIndex < words.length - 1) {
            setLoading(true);
            setCurrentIndex(currentIndex + 1);
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setLoading(true);
            setCurrentIndex(currentIndex - 1);
        }
    };

    const speech = (word: string) => {
        if (languageMappings?.[language]) {
            speak(word, {
                language: languageMappings[language]
            });
        } else {
            speak(word);
        }
    }

    useEffect(() => {
        if(languageMappings != null && !paused && words.length > 0 && languageMappings[language]) {
            speech(words[currentIndex].word)
        }
    }, [currentIndex, paused, languageMappings])

    return (
        <View style={styles.container}>
            <View style={styles.resultTextContainer}>
                <Text style={styles.result}>
                    Result:
                </Text>
                <Text style={styles.resultText}>
                    {
                        words.map((word) => (
                            <Text 
                                style={words[currentIndex] === word ? {fontWeight: "bold"} : {}}
                            >
                                {word.word + " "}  
                            </Text>
                        ))
                    }
                    {/* <>
                        {!paused && speech(words[currentIndex].word) }
                    </> */}
                </Text>
            </View>
            {words.length > 0 ? (
                <> 
                    <View style={styles.videoContainer}>
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color="#fff" />
                            </View>
                        )}
                        <Video
                            key={words[currentIndex].videoUrl}
                            source={{ uri: words[currentIndex].videoUrl }}
                            style={styles.video}
                            resizeMode="contain"
                            onEnd={handleEnd}
                            onLoad={() => setLoading(false)}
                            onError={() => setLoading(false)}
                            paused={paused}
                        />
                        <View style={styles.wordBanner}>
                            <Text style={styles.wordText}>{words[currentIndex].word}</Text>
                        </View>
                        <TouchableOpacity 
                            style={styles.pauseButton}
                            onPress={() => setPaused(!paused)}
                        >
                            <Ionicons 
                                name={paused ? "play" : "pause"} 
                                size={24} 
                                color="white" 
                            />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.controlsContainer}>
                        <TouchableOpacity 
                            style={[styles.navButton, currentIndex === 0 ? styles.disabledButton : null]}
                            onPress={goToPrevious}
                            disabled={currentIndex === 0}
                        >
                            <Ionicons name="chevron-back" size={28} color={currentIndex === 0 ? "#999" : "#333"} />
                            <Text style={[styles.navText, currentIndex === 0 ? styles.disabledText : null]}>Previous</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.counterText}>
                            {currentIndex + 1} / {words.length}
                        </Text>
                        
                        <TouchableOpacity 
                            style={[styles.navButton, currentIndex === words.length - 1 ? styles.disabledButton : null]}
                            onPress={goToNext}
                            disabled={currentIndex === words.length - 1}
                        >
                            <Text style={[styles.navText, currentIndex === words.length - 1 ? styles.disabledText : null]}>Next</Text>
                            <Ionicons name="chevron-forward" size={28} color={currentIndex === words.length - 1 ? "#999" : "#333"} />
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="videocam-off-outline" size={60} color="#888" />
                    <Text style={styles.emptyText}>No videos available</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        // width: '90%',
    },
    videoContainer: {
        width: '95%',
        height: 350,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#ededed',
        marginBottom: 16,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        // shadowColor: '#000',
        // shadowOffset: { width: 0, height: 4 },
        // shadowOpacity: 0.3,
        // shadowRadius: 6,
        // elevation: 10,
    },
    video: {
        width: '100%',
        height: '100%',
    },
    wordBanner: {
        position: 'absolute',
        top: 20,
        width: '90%',
        backgroundColor: "rgba(0, 0, 0, 0.3)",
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    wordText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '90%',
        paddingHorizontal: 10,
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 25,
        elevation: 2,
    },
    navText: {
        fontWeight: '600',
        color: '#333',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#e0e0e0',
        opacity: 0.7,
    },
    disabledText: {
        color: '#999',
    },
    counterText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#555',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    pauseButton: {
        position: 'absolute',
        bottom: 16,
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: 50,
        height: 50,
        borderRadius: "50%",
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 350,
        width: '90%',
        backgroundColor: '#f5f5f5',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 18,
        color: '#888',
        marginTop: 16,
        fontWeight: '500',
    },
    resultTextContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        flexWrap: "wrap",
        width: "100%",
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
        borderRadius: 8,
        backgroundColor: "#d4f8fc",
        fontWeight: 500,
        maxWidth: "80%",
        flexWrap: "wrap",
    }
});