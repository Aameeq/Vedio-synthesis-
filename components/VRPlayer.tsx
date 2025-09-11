import React, { useState, useEffect, useRef } from 'react';

// Simple vertex shader to position and texture the video screen
const vertexShaderSource = `
  attribute vec4 a_position;
  attribute vec2 a_texcoord;
  uniform mat4 u_matrix;
  varying vec2 v_texcoord;
  void main() {
    gl_Position = u_matrix * a_position;
    v_texcoord = a_texcoord;
  }
`;

// Simple fragment shader to apply the video texture
const fragmentShaderSource = `
  precision mediump float;
  varying vec2 v_texcoord;
  uniform sampler2D u_texture;
  void main() {
    gl_FragColor = texture2D(u_texture, v_texcoord);
  }
`;

interface VRPlayerProps {
    src: string | null;
    stereoSrc?: { left: string; right: string } | null;
}

const VRPlayer: React.FC<VRPlayerProps> = ({ src, stereoSrc }) => {
    const [isVRSupported, setIsVRSupported] = useState(false);
    const [xrSession, setXRSession] = useState<any | null>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const programRef = useRef<WebGLProgram | null>(null);
    
    const videoRefLeft = useRef<HTMLVideoElement | null>(null);
    const videoRefRight = useRef<HTMLVideoElement | null>(null);
    const videoTextureLeftRef = useRef<WebGLTexture | null>(null);
    const videoTextureRightRef = useRef<WebGLTexture | null>(null);

    const xrRefSpaceRef = useRef<any>(null);
    
    const positionBufferRef = useRef<WebGLBuffer | null>(null);
    const texcoordBufferRef = useRef<WebGLBuffer | null>(null);

    useEffect(() => {
        if ((navigator as any).xr) {
            (navigator as any).xr.isSessionSupported('immersive-vr').then((supported: boolean) => {
                setIsVRSupported(supported);
            });
        }
    }, []);

    useEffect(() => {
        return () => {
            xrSession?.end();
        };
    }, [xrSession]);

    const createVideoElement = (videoSrc: string) => {
        const video = document.createElement('video');
        video.src = videoSrc;
        video.crossOrigin = 'anonymous';
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        return video;
    }

    const initWebGLProgram = (gl: WebGLRenderingContext) => {
        const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        const program = gl.createProgram()!;
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        gl.useProgram(program);

        return program;
    };
    
    const initBuffers = (gl: WebGLRenderingContext) => {
        const screenWidth = 2;
        const screenHeight = screenWidth * (9/16);
        const positions = [ -screenWidth/2,-screenHeight/2,-2.5,  screenWidth/2,-screenHeight/2,-2.5, -screenWidth/2, screenHeight/2,-2.5, -screenWidth/2, screenHeight/2,-2.5,  screenWidth/2,-screenHeight/2,-2.5,  screenWidth/2, screenHeight/2,-2.5 ];
        positionBufferRef.current = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        const texcoords = [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0];
        texcoordBufferRef.current = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBufferRef.current);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
    };

    const initTexture = (gl: WebGLRenderingContext) => {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        return texture;
    }

    const onSessionStarted = async (session: any) => {
        setXRSession(session);
        
        const canvas = canvasRef.current!;
        const gl = canvas.getContext('webgl', { xrCompatible: true })! as WebGLRenderingContext;
        glRef.current = gl;

        await (gl as any).makeXRCompatible();
        session.updateRenderState({ baseLayer: new (window as any).XRWebGLLayer(session, gl) });
        
        xrRefSpaceRef.current = await session.requestReferenceSpace('local');
        programRef.current = initWebGLProgram(gl);
        initBuffers(gl);

        // Setup video elements and textures
        videoRefLeft.current = createVideoElement(stereoSrc ? stereoSrc.left : src!);
        videoTextureLeftRef.current = initTexture(gl);
        
        if (stereoSrc) {
            videoRefRight.current = createVideoElement(stereoSrc.right);
            videoTextureRightRef.current = initTexture(gl);
        }
        
        videoRefLeft.current.play();
        videoRefRight.current?.play();

        session.requestAnimationFrame(onXRFrame);
    };

    const onXRFrame = (time: number, frame: any) => {
        const session = frame.session;
        session.requestAnimationFrame(onXRFrame);

        const gl = glRef.current!;
        const program = programRef.current!;
        
        const baseLayer = session.renderState.baseLayer;
        gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer.framebuffer);

        gl.clearColor(0.1, 0.1, 0.1, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const pose = frame.getViewerPose(xrRefSpaceRef.current);
        if (!pose) return;
        
        if (videoRefRight.current && videoRefLeft.current) {
            // Basic synchronization
            videoRefRight.current.currentTime = videoRefLeft.current.currentTime;
        }

        const positionAttribLocation = gl.getAttribLocation(program, 'a_position');
        const texcoordAttribLocation = gl.getAttribLocation(program, 'a_texcoord');
        const matrixUniformLocation = gl.getUniformLocation(program, 'u_matrix');

        for (const view of pose.views) {
            const viewport = baseLayer.getViewport(view);
            gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            gl.enableVertexAttribArray(positionAttribLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBufferRef.current);
            gl.vertexAttribPointer(positionAttribLocation, 3, gl.FLOAT, false, 0, 0);

            gl.enableVertexAttribArray(texcoordAttribLocation);
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBufferRef.current);
            gl.vertexAttribPointer(texcoordAttribLocation, 2, gl.FLOAT, false, 0, 0);
            
            // Choose texture based on eye
            let videoElement: HTMLVideoElement | null = null;
            let texture: WebGLTexture | null = null;

            if (stereoSrc && view.eye === 'right') {
                videoElement = videoRefRight.current;
                texture = videoTextureRightRef.current;
            } else { // Default to left eye for mono or left eye view
                videoElement = videoRefLeft.current;
                texture = videoTextureLeftRef.current;
            }

            if (videoElement && videoElement.readyState >= videoElement.HAVE_CURRENT_DATA) {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, videoElement);
            }

            gl.uniformMatrix4fv(matrixUniformLocation, false, view.projectionMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    };

    const startVRSession = async () => {
        if (!src) return;
        try {
            const session = await (navigator as any).xr.requestSession('immersive-vr', {
                optionalFeatures: ['local-floor', 'bounded-floor']
            });
            session.addEventListener('end', () => {
                setXRSession(null);
                videoRefLeft.current?.pause();
                videoRefRight.current?.pause();
            });
            onSessionStarted(session);
        } catch (e) {
            console.error("Failed to start VR session:", e);
        }
    };

    if (!isVRSupported || !src) return null;
    if (xrSession) return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }} />;

    return (
        <button
            onClick={startVRSession}
            className="absolute bottom-4 right-4 z-10 px-4 py-2 bg-black bg-opacity-60 text-white font-bold rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
        >
            View in VR
        </button>
    );
};

export default VRPlayer;
