type LogMeta = Record<string, unknown>;

function safeMeta(meta?: LogMeta) {
  if (!meta) return {};
  const clone = { ...meta };
  if ("apiKey" in clone) clone.apiKey = "[redacted]";
  if ("base64Image" in clone) clone.base64Image = "[image-bytes]";
  return clone;
}

export const logger = {
  info(message: string, meta?: LogMeta) {
    console.info(`[resqai] ${message}`, safeMeta(meta));
  },
  warn(message: string, meta?: LogMeta) {
    console.warn(`[resqai] ${message}`, safeMeta(meta));
  },
  error(message: string, meta?: LogMeta) {
    console.error(`[resqai] ${message}`, safeMeta(meta));
  }
};
