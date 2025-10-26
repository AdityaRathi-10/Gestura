import { Ionicons } from "@expo/vector-icons"
import React, { useEffect, useRef, useState } from 'react';
import { Platform, Text, NativeModules, NativeEventEmitter, TouchableOpacity, Alert, Linking, View, StyleSheet } from 'react-native';
import {
    Camera,
    CameraPosition,
    Frame,
    useCameraDevice,
    useCameraPermission,
    useSkiaFrameProcessor,
    VisionCameraProxy,
} from 'react-native-vision-camera';
import { useSharedValue } from 'react-native-worklets-core';
import { Skia } from "@shopify/react-native-skia"
import labeledData from "@/assets/data_seq.json"
import { useExecutorchModule } from "react-native-executorch"

const { HandLandmarks } = NativeModules;
const handLandmarksEmitter = new NativeEventEmitter(HandLandmarks);

const handLandMarkPlugin = VisionCameraProxy.initFrameProcessorPlugin('handLandmarks', {});
function handLandmarks(frame: Frame) {
    'worklet';
    if (!handLandMarkPlugin) throw new Error('Failed to load Frame Processor Plugin!');
    return handLandMarkPlugin.call(frame);
}

const LINES = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8],
    [0, 9], [9, 10], [10, 11], [11, 12], [0, 13], [13, 14], [14, 15], [15, 16],
    [0, 17], [17, 18], [18, 19], [19, 20],
];

type KeypointData = {
    keypoint: number;
    x: number;
    y: number;
    z: number;
};

type KeypointsMap = {
    [key: string]: KeypointData
};

const linePaint = Skia.Paint();
linePaint.setColor(Skia.Color("white"));
linePaint.setStrokeWidth(5);

const circlePaint = Skia.Paint();
circlePaint.setColor(Skia.Color("aqua"));

export default function SignToText() {
    const model = useExecutorchModule({
        modelSource: require("@/assets/models/gestura_xnnpack_modified.pte")
    });

    const landmarks = useSharedValue<KeypointsMap[]>([]);
    const { hasPermission, requestPermission } = useCameraPermission();
    const [cameraType, setCameraType] = useState<CameraPosition>("back");
    const device = useCameraDevice(cameraType);
    const [cameraActive, setCameraActive] = useState(hasPermission);
    const [points, setPoints] = useState<KeypointsMap[]>([]);
    const [sign, setSign] = useState("");
    const [labelMapData, setLabelMapData] = useState<{ [key: string]: string }>({});
    const [handDetected, setHandsDetected] = useState(false)
    const numRef = useRef(0);
    const numArrayRef = useRef<number[][]>([]);

    useEffect(() => {
        if (HandLandmarks) HandLandmarks.initModel();
    }, []);

    useEffect(() => {
        const subscription = handLandmarksEmitter.addListener(
            'onHandLandmarksDetected',
            event => {
                const body: KeypointsMap = event.landmarks?.[0];
                if (!body) {
                    landmarks.value = [];
                    setPoints([]);
                    setSign("")
                    setHandsDetected(false)
                    return;
                }

                setHandsDetected(true)
                const pointsArray: number[] = [];
                for (const mark of Object.values(body)) {
                    const x = cameraType === "front" ? 1 - mark.x : mark.x;
                    pointsArray.push(x);
                    pointsArray.push(mark.y);
                }
                while (pointsArray.length < 84) pointsArray.push(0);
                numArrayRef.current.push(pointsArray);
                numRef.current++;

                if (numRef.current === 30) predictLocally();

                // For drawing on canvas
                landmarks.value = event.landmarks;
                setPoints(event.landmarks);
            }
        );
        return () => subscription.remove();
    }, [cameraType]);

    useEffect(() => {
        requestPermission().catch(console.error);
    }, []);

    useEffect(() => {
        setLabelMapData(labeledData)
    }, []);

    const predictLocally = async () => {
        try {
            const flatInput = numArrayRef.current.flat();
            const maxVal = Math.max(...flatInput);
            const safeMaxVal = maxVal === 0 ? 1 : maxVal;
            const normalizedPointsArray = flatInput.map((item) => (item / safeMaxVal));
            const inputArray = new Float32Array(normalizedPointsArray);
            const shape = [1, 30, 84];
            const index = await model.forward(inputArray, [shape]);
            if (index !== null && index[0][0] !== -1) {
                setSign(labelMapData[Math.floor(index[0][0]).toString()]);
            }
            console.log("id:", index[0][0]);
        } catch (error) {
            console.log("Error", error);
        } finally {
            numArrayRef.current = [];
            numRef.current = 0;
        }
    }

    const frameProcessor = useSkiaFrameProcessor(frame => {
        'worklet';
        frame.render();
        handLandmarks(frame);
        const frameWidth = frame.width;
        const frameHeight = frame.height;

        if (landmarks?.value.length > 0) {
            landmarks.value.forEach((body: KeypointsMap) => {
                for (const [from, to] of LINES) {
                    frame.drawLine(
                        body[from].x * frameWidth,
                        body[from].y * frameHeight,
                        body[to].x * frameWidth,
                        body[to].y * frameHeight,
                        linePaint
                    );
                }
                for (const mark of Object.values(body)) {
                    frame.drawCircle(mark.x * frameWidth, mark.y * frameHeight, 6, circlePaint);
                }
            });
        }
    }, []);

    const handlePermission = async () => {
        const granted = await requestPermission();
        if (!granted) {
            Alert.alert("Camera Access Required", "Please allow camera access.", [
                { text: "Cancel", style: "cancel" },
                { text: "Open Settings", onPress: () => Linking.openSettings() },
            ]);
        }
        if (granted) setCameraActive(true);
    };

    const toggleCameraView = () => setCameraType(prev => prev === "back" ? "front" : "back");

    const Permission = () => (
        <View style={styles.permissionContainer}>
            <View style={styles.permissionCard}>
                <Ionicons name="camera-outline" size={64} color="#4A90E2" />
                <Text style={styles.permissionTitle}>Camera Access</Text>
                <Text style={styles.message}>We need permission to access your camera</Text>
                <TouchableOpacity
                    onPress={handlePermission}
                    style={styles.permissionButton}
                >
                    <Text style={styles.buttonText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (!hasPermission) return <Permission />;
    if (!device) return <View style={styles.errorContainer}><Text style={styles.errorText}>Camera not available</Text></View>;

    const pixelFormat = Platform.OS === 'ios' ? 'rgb' : 'yuv';

    return (
        <View style={styles.container}>
            {cameraActive ? (
                <>
                    <Camera
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        frameProcessor={frameProcessor}
                        pixelFormat={pixelFormat}
                        videoHdr={false}
                        enableBufferCompression={true}
                        photo={false}
                    />
                    <View style={styles.topBar}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => setCameraActive(false)}>
                            <Ionicons name="close" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                        <View style={styles.signTextOverlay}>
                            {
                                handDetected && !sign
                                ? <Text style={{color: "white", fontSize: 14, paddingHorizontal: 8, paddingVertical: 4, backgroundColor: "rgba(0, 0, 0, 0.3)", textAlign: "center", marginTop: 16, borderRadius: 4}}>Predicting...</Text>
                                : sign && <Text style={styles.signText}>{sign}</Text>
                            }
                        </View>
                    </View>
                    <View style={styles.overlay}>
                        <TouchableOpacity style={styles.flipButton} onPress={toggleCameraView}>
                            <Ionicons name="camera-reverse-outline" size={28} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </>
            ) : (
                <View style={styles.startContainer}>
                    <View style={styles.startCard}>
                        <Ionicons name="camera" size={72} color="#4A90E2" />
                        <Text style={styles.startTitle}>Camera</Text>
                        <TouchableOpacity style={styles.startButton} onPress={() => setCameraActive(true)}>
                            <Text style={styles.buttonText}>Open Camera</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    permissionContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9F9FB" },
    permissionCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 30, width: "85%", alignItems: "center", elevation: 3 },
    permissionTitle: { fontSize: 24, fontWeight: "700", marginVertical: 16, color: "#2C3E50" },
    message: { fontSize: 16, textAlign: "center", color: "#7F8C8D", marginBottom: 24 },
    permissionButton: { backgroundColor: "#4A90E2", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, width: "100%" },
    errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9F9FB" },
    errorText: { fontSize: 18, textAlign: "center", color: "#E74C3C" },
    topBar: { position: "absolute", flexDirection: "row", width: "100%", top: 10, left: 10, zIndex: 10 },
    overlay: { position: "absolute", bottom: 50, flexDirection: "row", width: "100%", justifyContent: "space-around" },
    flipButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
    iconButton: { width: 44, height: 44, borderRadius: 22, marginTop: 12, marginLeft: 8, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
    signTextOverlay: { alignItems: "center", width: "65%" },
    signText: { textAlign: "center", backgroundColor: "rgba(43,161,252,0.6)", color: "#fff", paddingHorizontal: 14, paddingVertical: 4, borderRadius: 8, fontSize: 26, marginTop: 8 },
    startContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F9F9FB" },
    startCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 40, width: "85%", alignItems: "center", elevation: 3 },
    startTitle: { fontSize: 28, fontWeight: "700", marginVertical: 20, color: "#2C3E50" },
    startButton: { backgroundColor: "#4A90E2", paddingVertical: 14, paddingHorizontal: 32, borderRadius: 30, width: "100%", marginTop: 10 },
    buttonText: { fontSize: 16, fontWeight: "600", color: "#fff", textAlign: "center" },
});
