import type { DisasterType } from "@/lib/types/disaster";

export const offlineEmergencyTips: Record<DisasterType, string[]> = {
  flood: [
    "Move to higher ground immediately.",
    "Do not walk or drive through floodwater.",
    "Avoid touching electrical equipment if wet.",
    "Use SMS to share your location when data is weak."
  ],
  fire: [
    "Evacuate first, then call emergency services.",
    "Stay low under smoke.",
    "Do not use elevators during a fire.",
    "Close doors behind you if safe to slow smoke spread."
  ],
  earthquake: [
    "Drop, cover, and hold on during shaking.",
    "Move away from windows and tall furniture.",
    "After shaking stops, check exits before moving.",
    "Expect aftershocks and avoid damaged buildings."
  ],
  cyclone: [
    "Stay indoors away from windows.",
    "Keep phones charged and power banks ready.",
    "Move to a stronger interior room.",
    "Avoid coastal and low-lying areas during surge warnings."
  ],
  storm: [
    "Avoid open fields, trees, and metal structures.",
    "Do not touch downed power lines.",
    "Move indoors during lightning.",
    "Delay travel until visibility improves."
  ],
  "building-collapse": [
    "Move away from damaged structures.",
    "Do not re-enter unstable buildings.",
    "Call emergency services if anyone is trapped.",
    "Signal with sound if trapped and conserve phone battery."
  ],
  unknown: [
    "Move away from immediate danger.",
    "Call local emergency services if risk is imminent.",
    "Share your location with trusted contacts.",
    "Preserve phone battery and follow official alerts."
  ]
};
