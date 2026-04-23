// Central place for non-secret configuration shared across stacks.
// Secrets go in ./secrets.ts — keep domain names, versions, constants here.

export const APP_DOMAIN = "example.com";
export const API_DOMAIN = `api.${APP_DOMAIN}`;
export const WEB_DOMAIN = APP_DOMAIN;

export const VERSION = "0.0.1";
