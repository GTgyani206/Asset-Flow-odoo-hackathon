// Config package entry point.
// Will export Zod-validated environment variable schemas and config loader utilities.
// Applications call loadConfig() at startup; this package validates and throws early
// if required variables are missing or malformed.

export const CONFIG_VERSION = "0.0.1";
