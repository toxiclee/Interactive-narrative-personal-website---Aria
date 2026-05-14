"use client";

import PhotographyCorridor from "./PhotographyCorridor";

export default function PhotographySection() {
  return (
    <section
      id="photography"
      style={{
        position: "relative",
        marginTop: "clamp(-20vh, -15vw, -7rem)",
      }}
    >
      <PhotographyCorridor />
    </section>
  );
}
