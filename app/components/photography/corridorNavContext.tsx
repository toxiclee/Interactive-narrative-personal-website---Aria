"use client";

import * as THREE from "three";
import { createContext, useContext, useMemo, useRef } from "react";

export type CorridorNavState = {
  mode: "idle" | "animating";
  anchor: string;
  t: number;
  seeded: boolean;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  startLook: THREE.Vector3;
  endLook: THREE.Vector3;
};

export type CorridorNavApi = {
  navRef: React.MutableRefObject<CorridorNavState>;
  lookAtRef: React.MutableRefObject<THREE.Vector3>;
  mouseRef: React.MutableRefObject<{ x: number; y: number }>;
  beginNavigation: (
    anchor: string,
    endCam: THREE.Vector3,
    endLook: THREE.Vector3,
  ) => void;
};

const CorridorNavContext = createContext<CorridorNavApi | null>(null);

export function CorridorNavProvider({
  children,
  mouseRef: mouseRefProp,
}: {
  children: React.ReactNode;
  mouseRef?: React.MutableRefObject<{ x: number; y: number }>;
}) {
  const navRef = useRef<CorridorNavState>({
    mode: "idle",
    anchor: "",
    t: 0,
    seeded: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startLook: new THREE.Vector3(),
    endLook: new THREE.Vector3(),
  });
  const lookAtRef = useRef(new THREE.Vector3(0, 1.38, -6));
  const internalMouse = useRef({ x: 0, y: 0 });
  const mouseRef = mouseRefProp ?? internalMouse;

  const api = useMemo<CorridorNavApi>(
    () => ({
      navRef,
      lookAtRef,
      mouseRef,
      beginNavigation(anchor, endCam, endLook) {
        const n = navRef.current;
        n.mode = "animating";
        n.anchor = anchor;
        n.t = 0;
        n.seeded = false;
        n.endPos.copy(endCam);
        n.endLook.copy(endLook);
      },
    }),
    [mouseRef],
  );

  return (
    <CorridorNavContext.Provider value={api}>{children}</CorridorNavContext.Provider>
  );
}

export function useCorridorNav() {
  const v = useContext(CorridorNavContext);
  if (!v) throw new Error("useCorridorNav inside CorridorNavProvider");
  return v;
}
