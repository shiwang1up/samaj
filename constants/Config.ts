const HOST = "192.168.29.117";
const PORT  = 4000;

export const Config = {
  HOST,
  PORT,
  /** Single API root — all services derive their paths from this. */
  BASE_URL: `http://${HOST}:${PORT}/api`,
} as const;
