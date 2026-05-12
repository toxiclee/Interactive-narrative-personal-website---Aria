"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const MOUTH_OPEN_THRESHOLD = 0.03;
const MOUTH_OPEN_DELAY_MS = 300;

const MOTION_PIXEL_THRESHOLD = 20;
const MOTION_PERCENT_NEEDED = 0.035;
const MOTION_FRAMES_NEEDED = 1;
const WAVE_COOLDOWN_MS = 2000;

const SENTENCES = [
  "I'm writing this from a coffee shop in New Haven.",
  "The music is louder than the gray afternoon outside, conversations drift across the room, and cups touch the tables like small interruptions of time.",
  "Beyond the classroom windows, the trees sway lightly in the wind as if the season is quietly leaving without telling anyone.",
  "A classmate I barely knew passed by a moment ago.",
  "For some reason, I suddenly thought: perhaps we will never see each other again.",
  "I think a lot about moments like this — the fragile ways people pass through each other's lives, leaving behind fragments of memory, atmosphere, and feeling that are often difficult to explain directly.",
  "Maybe that is why I've always been drawn to photography, moving images, and interactive spaces.",
  "I'm interested in building experiences that help people feel closer to one another through interaction, space, and emotion.",
  "Not only through information, but through environments that can be wandered through slowly — spaces shaped by memory, sound, movement, and observation.",
  "This website is part portfolio, part archive, and part experiment.",
  "A place where visual storytelling, technology, and human feeling intersect.",
  "A small attempt to explore how digital spaces might become more intimate, poetic, and emotionally alive.",
];

const VISION_VERSION = "0.10.32";
const VISION_CDN = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}/wasm`;
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

// Native browser import() — bypasses Turbopack's bundler entirely
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nativeImport = (url: string): Promise<any> =>
  new Function("u", "return import(u)")(url);

export function useEmbodiedLetter(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [phase, setPhase] = useState<"prompt" | "active">("prompt");
  const [isNarrating, setIsNarrating] = useState(false);
  const [hasNarrationStarted, setHasNarrationStarted] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
  const [hasWaved, setHasWaved] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const faceLandmarkerRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const destroyedRef = useRef(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const mouthOpenSinceRef = useRef<number | null>(null);
  const narrationTriggeredRef = useRef(false);
  const hasWavedRef = useRef(false);
  const queueIndexRef = useRef(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const motionCountRef = useRef(0);
  const directionVotesRef = useRef<("left" | "right")[]>([]);
  const lastTimestampRef = useRef(0);
  const loopCountRef = useRef(0);
  const lastWaveTimeRef = useRef(0);

  // --------------- Narration ---------------

  const speakSentence = useCallback((index: number) => {
    const synth = synthRef.current;
    if (!synth || index >= SENTENCES.length) {
      setIsNarrating(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(SENTENCES[index]);
    utterance.rate = 0.78;
    utterance.pitch = 0.92;
    utterance.volume = 0.9;

    const voices = synth.getVoices();
    const femaleNames = [
      "Zoe", "Samantha (Enhanced)", "Karen (Enhanced)", "Moira (Enhanced)",
      "Samantha", "Karen", "Moira", "Fiona", "Tessa", "Veena",
      "Microsoft Zira", "Google UK English Female",
    ];
    const preferred =
      femaleNames.reduce<SpeechSynthesisVoice | null>(
        (found, name) => found ?? voices.find((v) => v.name.includes(name) && v.lang.startsWith("en")) ?? null,
        null,
      ) ??
      voices.find((v) => v.lang.startsWith("en") && v.localService) ??
      voices.find((v) => v.lang.startsWith("en"));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setCurrentSentenceIndex(index); setIsNarrating(true); };
    utterance.onend = () => {
      const next = index + 1;
      queueIndexRef.current = next;
      if (next < SENTENCES.length) {
        setTimeout(() => speakSentence(next), 400);
      } else {
        setIsNarrating(false);
        setCurrentSentenceIndex(-1);
      }
    };
    synth.speak(utterance);
  }, []);

  const startNarration = useCallback(() => {
    const synth = synthRef.current;
    if (!synth || narrationTriggeredRef.current) return;
    narrationTriggeredRef.current = true;
    setHasNarrationStarted(true);
    setIsNarrating(true);
    const startFrom = queueIndexRef.current >= SENTENCES.length ? 0 : queueIndexRef.current;
    queueIndexRef.current = startFrom;
    speakSentence(startFrom);
  }, [speakSentence]);

  // --------------- Motion detection (for wave) ---------------

  function detectMotion(video: HTMLVideoElement) {
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    const w = 80, h = 60;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { triggered: false, direction: null as "left" | "right" | null };

    ctx.drawImage(video, 0, 0, w, h);
    const current = ctx.getImageData(0, 0, w, h);

    if (!prevFrameRef.current) {
      prevFrameRef.current = current;
      return { triggered: false, direction: null as "left" | "right" | null };
    }

    const prev = prevFrameRef.current.data;
    const curr = current.data;
    let changedPixels = 0;
    let xSum = 0;
    const pixelCount = w * h;

    for (let i = 0; i < curr.length; i += 4) {
      const dr = Math.abs(curr[i] - prev[i]);
      const dg = Math.abs(curr[i + 1] - prev[i + 1]);
      const db = Math.abs(curr[i + 2] - prev[i + 2]);
      if ((dr + dg + db) / 3 > MOTION_PIXEL_THRESHOLD) {
        const pixelIdx = i / 4;
        xSum += pixelIdx % w;
        changedPixels++;
      }
    }

    prevFrameRef.current = current;
    const percent = changedPixels / pixelCount;
    const triggered = percent > MOTION_PERCENT_NEEDED;
    let direction: "left" | "right" | null = null;
    if (triggered && changedPixels > 0) {
      const avgX = xSum / changedPixels;
      direction = avgX < w / 2 ? "right" : "left";
    }
    return { triggered, direction, percent };
  }

  // --------------- Detection loop ---------------

  const detectLoop = useCallback(() => {
    if (destroyedRef.current) return;
    const video = videoRef.current;

    if (!video || video.readyState < 2 || video.videoWidth === 0) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    loopCountRef.current++;

    try {
      // --- Face detection (mouth open → narration) — only if model is loaded ---
      const faceLandmarker = faceLandmarkerRef.current;
      if (faceLandmarker && !narrationTriggeredRef.current) {
        const now = performance.now();
        if (now > lastTimestampRef.current) {
          lastTimestampRef.current = now;

          // Draw video to a canvas and pass THAT to MediaPipe
          // (video element off-screen may not provide frames directly)
          if (!faceCanvasRef.current) faceCanvasRef.current = document.createElement("canvas");
          const fc = faceCanvasRef.current;
          fc.width = video.videoWidth || 320;
          fc.height = video.videoHeight || 240;
          const fctx = fc.getContext("2d");
          if (fctx) {
            fctx.drawImage(video, 0, 0, fc.width, fc.height);

            // Temporarily mute console.error/warn for detect call (MediaPipe INFO/WARNING messages)
            const _ce = console.error;
            const _cw = console.warn;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.error = (...args: any[]) => {
              if (typeof args[0] === "string" && (args[0].includes("TensorFlow Lite") || args[0].includes("inference_feedback") || args[0].startsWith("INFO:"))) return;
              _ce.apply(console, args);
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            console.warn = (...args: any[]) => {
              if (typeof args[0] === "string" && (args[0].includes("inference_feedback") || args[0].startsWith("W0"))) return;
              _cw.apply(console, args);
            };

            const result = faceLandmarker.detectForVideo(fc, now);
            console.error = _ce;
            console.warn = _cw;

            if (result.faceLandmarks && result.faceLandmarks.length > 0) {
              const landmarks = result.faceLandmarks[0];
              const upperLip = landmarks[13];
              const lowerLip = landmarks[14];
              const mouthGap = Math.abs(lowerLip.y - upperLip.y);

              if (mouthGap > MOUTH_OPEN_THRESHOLD) {
                if (!mouthOpenSinceRef.current) {
                  mouthOpenSinceRef.current = Date.now();
                } else if (Date.now() - mouthOpenSinceRef.current > MOUTH_OPEN_DELAY_MS) {
                  console.log("[embodied] mouth open detected → starting narration");
                  startNarration();
                }
              } else {
                mouthOpenSinceRef.current = null;
              }
            } else if (loopCountRef.current % 60 === 0) {
              console.log("[embodied] no face detected in frame");
            }
          }
        }
      }

      // --- Motion detection (runs independently, no model needed) ---
      {
        const { triggered, direction, percent } = detectMotion(video);

        // Log motion every 60 frames
        if (loopCountRef.current % 60 === 0) {
          console.log(`[embodied] motion: ${(percent * 100).toFixed(1)}% changed, triggered=${triggered}, direction=${direction}`);
        }

        const now2 = Date.now();
        const cooldownOk = now2 - lastWaveTimeRef.current > WAVE_COOLDOWN_MS;

        if (triggered && direction && cooldownOk) {
          motionCountRef.current++;
          directionVotesRef.current.push(direction);
          if (motionCountRef.current >= MOTION_FRAMES_NEEDED) {
            const votes = directionVotesRef.current;
            const rightVotes = votes.filter((d) => d === "right").length;
            const dominant = rightVotes > votes.length / 2 ? "right" : "left";

            if (dominant === "right" && !hasWavedRef.current) {
              console.log("[embodied] wave → text disappear");
              hasWavedRef.current = true;
              setHasWaved(true);
              lastWaveTimeRef.current = now2;
            } else if (dominant === "left" && hasWavedRef.current) {
              console.log("[embodied] wave → text return");
              hasWavedRef.current = false;
              setHasWaved(false);
              lastWaveTimeRef.current = now2;
            }
            motionCountRef.current = 0;
            directionVotesRef.current = [];
          }
        } else if (!triggered) {
          motionCountRef.current = Math.max(0, motionCountRef.current - 1);
          if (motionCountRef.current === 0) directionVotesRef.current = [];
        }
      }
    } catch (e) {
      if (loopCountRef.current < 5) console.log("[embodied] detectLoop error:", e);
    }

    if (!destroyedRef.current) {
      rafRef.current = requestAnimationFrame(detectLoop);
    }
  }, [videoRef, startNarration]);

  // --------------- Init models (CDN-based, bypasses Turbopack) ---------------

  const initModels = useCallback(async () => {
    if (destroyedRef.current) return;

    // Start the detection loop immediately — motion detection works without models
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(detectLoop);
    }
    console.log("[embodied] detection loop queued, loading face model from CDN...");

    try {
      // Use native browser import() to load from CDN — completely bypasses Turbopack
      const vision = await nativeImport(
        `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VISION_VERSION}`
      );
      await initFaceLandmarker(vision);
    } catch (err) {
      console.log("[embodied] face model init failed — motion detection still active:", err);
    }
  }, [detectLoop]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initFaceLandmarker = useCallback(async (vision: any) => {
    if (destroyedRef.current) return;
    const { FaceLandmarker, FilesetResolver } = vision;

    // Temporarily mute console.error during model init (MediaPipe INFO messages)
    const _ce = console.error;
    const _cw = console.warn;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error = (...args: any[]) => {
      if (typeof args[0] === "string" && (args[0].includes("TensorFlow Lite") || args[0].includes("inference_feedback") || args[0].startsWith("INFO:") || args[0].startsWith("W0"))) return;
      _ce.apply(console, args);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.warn = (...args: any[]) => {
      if (typeof args[0] === "string" && (args[0].includes("inference_feedback") || args[0].includes("face_landmarker_graph") || args[0].includes("gl_context"))) return;
      _cw.apply(console, args);
    };

    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(VISION_CDN);
      if (destroyedRef.current) return;

      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: MODEL_URL,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFacialTransformationMatrixes: false,
        outputFaceBlendshapes: false,
      });
      if (destroyedRef.current) return;

      faceLandmarkerRef.current = faceLandmarker;
      setModelsReady(true);
      console.log("[embodied] face model loaded successfully");
    } finally {
      console.error = _ce;
      console.warn = _cw;
    }
  }, []);

  // --------------- Webcam ---------------

  const startWebcam = useCallback(async () => {
    console.log("[embodied] requesting webcam...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        console.log("[embodied] webcam active, video playing");
        setWebcamActive(true);
        setPhase("active");
        initModels();
      }
    } catch (err) {
      console.log("[embodied] webcam failed, entering fallback mode:", err);
      setFallbackMode(true);
      setPhase("active");
    }
  }, [videoRef, initModels]);

  // --------------- Keyboard fallback ---------------

  useEffect(() => {
    if (!fallbackMode) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ":
          e.preventDefault();
          startNarration();
          break;
        case "w": case "W":
          hasWavedRef.current = true;
          setHasWaved(true);
          break;
        case "r": case "R":
          hasWavedRef.current = false;
          setHasWaved(false);
          narrationTriggeredRef.current = false;
          setHasNarrationStarted(false);
          setIsNarrating(false);
          setCurrentSentenceIndex(-1);
          queueIndexRef.current = 0;
          prevFrameRef.current = null;
          motionCountRef.current = 0;
          synthRef.current?.cancel();
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fallbackMode, startNarration]);

  // --------------- SpeechSynthesis ---------------

  useEffect(() => {
    if (typeof window !== "undefined") synthRef.current = window.speechSynthesis;
    return () => { synthRef.current?.cancel(); };
  }, []);

  // --------------- Cleanup ---------------

  useEffect(() => {
    destroyedRef.current = false;
    return () => {
      destroyedRef.current = true;
      if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = 0; }
      try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch { /* ok */ }
      streamRef.current = null;
      faceLandmarkerRef.current = null;
      canvasRef.current = null;
      faceCanvasRef.current = null;
      prevFrameRef.current = null;
      synthRef.current?.cancel();
    };
  }, []);

  return {
    sentences: SENTENCES,
    phase,
    isNarrating,
    hasNarrationStarted,
    currentSentenceIndex,
    hasWaved,
    webcamActive,
    fallbackMode,
    modelsReady,
    startWebcam,
    startFallback: () => { setFallbackMode(true); setPhase("active"); },
    startNarration,
  };
}
