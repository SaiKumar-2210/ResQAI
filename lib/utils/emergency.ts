import type { DisasterType } from "@/lib/types/disaster";
import type { UserLocation } from "@/lib/hooks/useUserLocation";

export function emergencyNumberForScenario(scenario: DisasterType) {
  if (scenario === "fire") return "101";
  return "112";
}

export function mapUrlForLocation(location: UserLocation) {
  return `https://maps.google.com/?q=${location.latitude},${location.longitude}`;
}

export function buildEmergencyLocationMessage(scenario: DisasterType, location: UserLocation | null) {
  const hazard = scenario === "unknown" ? "emergency" : scenario;
  const locationText = location
    ? `My location is ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}. Map: ${mapUrlForLocation(location)}. Accuracy about ${Math.round(location.accuracy)} meters.`
    : "My location is not available yet.";

  return `Emergency help needed for ${hazard}. ${locationText}`;
}
