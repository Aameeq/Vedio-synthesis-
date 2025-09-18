// A utility function to orchestrate the playback and drawing of a single video
const processVideo = (
  video: HTMLVideoElement,
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  onProgressFrame: () => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let animationFrameId: number;

    const onPaint = () => {
      if (video.paused || video.ended) {
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      onProgressFrame(); // Notify that a frame has been processed
      animationFrameId = requestAnimationFrame(onPaint);
    };

    video.addEventListener('ended', () => {
      cancelAnimationFrame(animationFrameId);
      // Draw the very last frame to ensure it's included
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve();
    });
    
    video.addEventListener('error', (e) => {
        cancelAnimationFrame(animationFrameId);
        reject(new Error(`Video playback error: ${video.error?.message}`));
    });

    video.play().catch(e => reject(e));
    animationFrameId = requestAnimationFrame(onPaint);
  });
};

/**
 * Stitches multiple videos together into a single video file.
 * @param videoUrls An array of object URLs for the videos to stitch.
 * @param onProgress A callback function to report rendering progress (0-100).
 * @returns A promise that resolves with a new object URL for the stitched video Blob.
 */
export const stitchVideos = async (
  videoUrls: string[],
  onProgress: (progress: number) => void
): Promise<string> => {
  if (!videoUrls || videoUrls.length === 0) {
    throw new Error("No video URLs provided for stitching.");
  }

  // Create a temporary video element to get dimensions from the first clip
  const firstVideo = document.createElement('video');
  firstVideo.muted = true;
  firstVideo.src = videoUrls[0];
  
  await new Promise<void>((resolve, reject) => {
    firstVideo.onloadedmetadata = () => resolve();
    firstVideo.onerror = () => reject("Failed to load metadata for the first video.");
  });

  // Setup the canvas to match video dimensions
  const canvas = document.createElement('canvas');
  canvas.width = firstVideo.videoWidth;
  canvas.height = firstVideo.videoHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
      throw new Error("Could not get 2D canvas context.");
  }

  // Setup MediaRecorder to capture the canvas stream
  const stream = canvas.captureStream(30); // Capture at 30 FPS
  const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  const chunks: Blob[] = [];

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const stitchingPromise = new Promise<string>((resolve, reject) => {
      recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          resolve(url);
      };
      recorder.onerror = (e) => reject(e);
  });
  
  recorder.start();
  
  // Estimate total frames for progress calculation
  const frameRate = 30; // Matches captureStream rate
  const videoDurations = await Promise.all(videoUrls.map(url => new Promise<number>((res, rej) => {
      const v = document.createElement('video');
      v.src = url;
      v.onloadedmetadata = () => res(v.duration);
      v.onerror = () => rej(`Failed to get duration for ${url}`);
  })));
  const totalDuration = videoDurations.reduce((a, b) => a + b, 0);
  const totalFrames = totalDuration * frameRate;
  let framesProcessed = 0;

  // Process each video sequentially
  for (const url of videoUrls) {
    const video = document.createElement('video');
    video.muted = true;
    video.src = url;

    await new Promise<void>((resolve, reject) => {
        video.oncanplaythrough = () => resolve();
        video.onerror = () => reject(`Failed to load video for rendering: ${url}`);
    });
    
    await processVideo(video, ctx, canvas, () => {
        framesProcessed++;
        onProgress(Math.min(100, (framesProcessed / totalFrames) * 100));
    });
  }

  recorder.stop();
  return stitchingPromise;
};