import { logger } from "./logger";

export type AnalyticsEvent =
  | "image_analysis_started"
  | "image_analysis_completed"
  | "image_analysis_failed"
  | "slow_ai_response"
  | "chat_stream_started"
  | "chat_stream_failed"
  | "checklist_generated"
  | "demo_started";

export function trackEvent(event: AnalyticsEvent, meta?: Record<string, unknown>) {
  logger.info(`analytics:${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...meta
  });
}
