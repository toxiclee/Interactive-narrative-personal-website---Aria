"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/** RGB channel delta per pixel; higher = ignore small noise (auto exposure, compression). */
const MOTION_PIXEL_THRESHOLD = 34;
/** Fraction of downscaled frame that must change to count as motion (0–1). */
const MOTION_PERCENT_NEEDED = 0.1;
/** Consecutive motion frames before we evaluate a gesture (debounce). */
const MOTION_FRAMES_NEEDED = 12;
/** Share of votes that must agree on one side (e.g. 0.72 → 9/12) or we discard the burst. */
const DIRECTION_AGREE_RATIO = 0.72;
const WAVE_COOLDOWN_MS = 2600;

const SENTENCES = [
  "I'm writing this from a coffee shop in New Haven.",
  "The music is louder than the gray afternoon outside, and conversations drift across the room like fragments of passing moments.",
  "Sometimes I think about how people move through each other's lives so briefly, yet still leave behind certain emotions, memories, and atmospheres that quietly stay with us.",
  "This page is my attempt to give those feelings a space to exist.",
  "Not in a perfectly organized way, but in the way memories actually feel: fragmented, intimate, soft, sometimes overwhelming.",
  "I'm interested in building experiences that help people feel closer to one another through interaction, space, and emotion — environments that can be wandered through slowly, shaped by memory, sound, movement, and observation.",
  "So this website became part portfolio, part archive, and part experiment.",
  "A place where visual storytelling, technology, and human feeling intersect.",
  "You may say I'm a dreamer, but I'm not the only one.",
];

export function useEmbodiedLetter(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [hasWaved, setHasWaved] = useState(false);
  const [webcamActive, setWebcamActive] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const destroyedRef = useRef(false);
  const hasWavedRef = useRef(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevFrameRef = useRef<ImageData | null>(null);
  const motionCountRef = useRef(0);
  const directionVotesRef = useRef<("left" | "right")[]>([]);
  const lastWaveTimeRef = useRef(0);

  function detectMotion(video: HTMLVideoElement) {
    if (!canvasRef.current) canvasRef.current = document.createElement("canvas");
    const canvas = canvasRef.current;
    const w = 80,
      h = 60;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return { triggered: false, direction: null as "left" | "right" | null, percent: 0 };

    ctx.drawImage(video, 0, 0, w, h);
    const current = ctx.getImageData(0, 0, w, h);

    if (!prevFrameRef.current) {
      prevFrameRef.current = current;
      return { triggered: false, direction: null as "left" | "right" | null, percent: 0 };
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

  const detectLoop = useCallback(() => {
    if (destroyedRef.current) return;
    const video = videoRef.current;

    if (!video || video.readyState < 2 || video.videoWidth === 0) {
      rafRef.current = requestAnimationFrame(detectLoop);
      return;
    }

    try {
      const { triggered, direction } = detectMotion(video);
      const now2 = Date.now();
      const cooldownOk = now2 - lastWaveTimeRef.current > WAVE_COOLDOWN_MS;

      if (triggered && direction && cooldownOk) {
        motionCountRef.current++;
        directionVotesRef.current.push(direction);
        if (motionCountRef.current >= MOTION_FRAMES_NEEDED) {
          const votes = directionVotesRef.current;
          const rightVotes = votes.filter((d) => d === "right").length;
          const n = votes.length;
          const need = Math.ceil(n * DIRECTION_AGREE_RATIO);
          const dominant: "left" | "right" | null =
            rightVotes >= need ? "right" : n - rightVotes >= need ? "left" : null;

          if (dominant === "right" && !hasWavedRef.current) {
            hasWavedRef.current = true;
            setHasWaved(true);
            lastWaveTimeRef.current = now2;
          } else if (dominant === "left" && hasWavedRef.current) {
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
    } catch {
      /* teardown */
    }

    if (!destroyedRef.current) {
      rafRef.current = requestAnimationFrame(detectLoop);
    }
  }, [videoRef]);

  const startMotionLoop = useCallback(() => {
    if (destroyedRef.current) return;
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(detectLoop);
    }
  }, [detectLoop]);

  const startWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: "user" },
      });
      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        await video.play();
        setFallbackMode(false);
        setWebcamActive(true);
        startMotionLoop();
      }
    } catch {
      setFallbackMode(true);
    }
  }, [videoRef, startMotionLoop]);

  useEffect(() => {
    if (!fallbackMode) return;
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "w":
        case "W":
          hasWavedRef.current = true;
          setHasWaved(true);
          break;
        case "r":
        case "R":
          hasWavedRef.current = false;
          setHasWaved(false);
          prevFrameRef.current = null;
          motionCountRef.current = 0;
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [fallbackMode]);

  useEffect(() => {
    destroyedRef.current = false;
    return () => {
      destroyedRef.current = true;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
      } catch {
        /* ok */
      }
      streamRef.current = null;
      canvasRef.current = null;
      prevFrameRef.current = null;
    };
  }, []);

  return {
    sentences: SENTENCES,
    hasWaved,
    webcamActive,
    fallbackMode,
    startWebcam,
    startFallback: () => {
      setFallbackMode(true);
    },
  };
}
