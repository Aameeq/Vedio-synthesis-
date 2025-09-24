// Fix: Changed React import to a namespace import to resolve JSX intrinsic element errors.
import * as React from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { AnchorPoint, Transform } from '../types';

interface ARPreviewProps {
    modelFile: File;
    stream: MediaStream;
    transform: Transform;
    anchorPoint: AnchorPoint;
    setTransform: (transform: Transform) => void;
}

const ANCHOR_POINTS: { [key in AnchorPoint]: number } = {
    'head': 10,
    'nose': 1,
    'forehead': 151,
    'chin': 175,
};

const ARPreview: React.FC<ARPreviewProps> = ({ modelFile, stream, transform, anchorPoint, setTransform }) => {
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const sceneRef = React.useRef(new THREE.Scene());
    const cameraRef = React.useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = React.useRef<THREE.WebGLRenderer | null>(null);
    const modelRef = React.useRef<THREE.Group | null>(null);
    const faceLandmarkerRef = React.useRef<FaceLandmarker | null>(null);
    const animationFrameId = React.useRef<number | null>(null);
    const lastVideoTimeRef = React.useRef(-1);
    const [isInitialized, setIsInitialized] = React.useState(false);

    React.useEffect(() => {
        const init = async () => {
            try {
                const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm");
                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
                        delegate: "GPU"
                    },
                    outputFaceBlendshapes: true,
                    runningMode: "VIDEO",
                    numFaces: 1
                });
                faceLandmarkerRef.current = landmarker;

                const canvas = canvasRef.current!;
                const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
                renderer.setPixelRatio(window.devicePixelRatio);
                renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
                rendererRef.current = renderer;

                cameraRef.current = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
                
                const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
                sceneRef.current.add(ambientLight);
                const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
                directionalLight.position.set(0, 2, 2);
                sceneRef.current.add(directionalLight);
                
                setIsInitialized(true);

            } catch (error) {
                console.error("Initialization failed:", error);
            }
        };
        init();
    }, []);

    React.useEffect(() => {
        if (!modelFile) return;

        if (modelRef.current) {
            sceneRef.current.remove(modelRef.current);
            modelRef.current = null;
        }

        const loader = new GLTFLoader();
        const objectUrl = URL.createObjectURL(modelFile);
        loader.load(objectUrl, (gltf) => {
            const box = new THREE.Box3().setFromObject(gltf.scene);
            const center = box.getCenter(new THREE.Vector3());
            gltf.scene.position.sub(center);
            modelRef.current = gltf.scene;
            sceneRef.current.add(modelRef.current);
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });

        return () => URL.revokeObjectURL(objectUrl);
    }, [modelFile]);

    React.useEffect(() => {
        if (!isInitialized || !stream || !videoRef.current) return;
        
        const video = videoRef.current;
        video.srcObject = stream;
        video.play();

        const predictWebcam = () => {
            const landmarker = faceLandmarkerRef.current;
            if (!landmarker || video.currentTime === lastVideoTimeRef.current) {
                animationFrameId.current = requestAnimationFrame(predictWebcam);
                return;
            }

            lastVideoTimeRef.current = video.currentTime;
            const results = landmarker.detectForVideo(video, Date.now());
            onFaceMeshResults(results);

            animationFrameId.current = requestAnimationFrame(predictWebcam);
        };

        const onCanPlay = () => {
           if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
           predictWebcam();
        }

        video.addEventListener("canplay", onCanPlay);

        return () => {
            video.removeEventListener("canplay", onCanPlay);
            if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };

    }, [isInitialized, stream]);


    const onFaceMeshResults = (results: any) => {
        const canvas = canvasRef.current;
        const camera = cameraRef.current;
        const renderer = rendererRef.current;
        const model = modelRef.current;
        
        if(!canvas || !camera || !renderer) return;

        renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();

        if (!model || !results.faceLandmarks || results.faceLandmarks.length === 0) {
            if (model) model.visible = false;
            renderer.render(sceneRef.current, camera);
            return;
        }

        model.visible = true;
        const landmarks = results.faceLandmarks[0];
        
        const anchorIndex = ANCHOR_POINTS[anchorPoint];
        const anchor = landmarks[anchorIndex];
        
        const fov = camera.fov * (Math.PI / 180);
        const z = canvas.clientHeight / (2 * Math.tan(fov/2));
        camera.position.set(0, 0, z);

        const vec = new THREE.Vector3((anchor.x - 0.5) * canvas.clientWidth, -(anchor.y - 0.5) * canvas.clientHeight, 0);
        model.position.copy(vec);
        
        model.position.x += transform.position.x * 100;
        model.position.y += transform.position.y * 100;
        model.position.z += transform.position.z * 100;
        
        const scale = (landmarks[386].x - landmarks[159].x) * canvas.clientWidth * 1.5 * transform.scale;
        model.scale.set(scale, scale, scale);

        // Get base rotation from head tracking
        const headQuaternion = new THREE.Quaternion();
        if (results.facialTransformationMatrixes && results.facialTransformationMatrixes.length > 0 && results.facialTransformationMatrixes[0].data) {
            const rotationMatrix = new THREE.Matrix4().fromArray(results.facialTransformationMatrixes[0].data);
            headQuaternion.setFromRotationMatrix(rotationMatrix);
        }

        // Get user-controlled rotation adjustment from sliders
        const userEuler = new THREE.Euler(transform.rotation.x, transform.rotation.y, transform.rotation.z);
        const userQuaternion = new THREE.Quaternion().setFromEuler(userEuler);

        // Combine rotations: first apply head tracking, then user adjustments
        model.quaternion.copy(headQuaternion).multiply(userQuaternion);
        
        renderer.render(sceneRef.current, camera);
    };

    return (
        <div className="w-full h-full relative aspect-video bg-black rounded-lg shadow-2xl flex items-center justify-center overflow-hidden">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]" />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
            {!isInitialized && <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">Initializing AR Engine...</div>}
        </div>
    );
};

export default ARPreview;
