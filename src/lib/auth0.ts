import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(
      `Missing required environment variable: ${name}. Did you create .env.local from .env.local.example and restart the dev server?`,
    );
  }
  return value;
}

function requireMinLength(name: string, min: number): string {
  const value = requireEnv(name);
  if (value.length < min) {
    throw new Error(
      `${name} must be at least ${min} characters (got ${value.length}). Generate one with: openssl rand -hex 32`,
    );
  }
  return value;
}

export const auth0 = new Auth0Client({
  domain: requireEnv("AUTH0_DOMAIN"),
  clientId: requireEnv("AUTH0_CLIENT_ID"),
  clientSecret: requireEnv("AUTH0_CLIENT_SECRET"),
  secret: requireMinLength("AUTH0_SECRET", 32),
  appBaseUrl: requireEnv("APP_BASE_URL"),
  onCallback: async (error, ctx) => {
    const appBaseUrl = ctx.appBaseUrl ?? requireEnv("APP_BASE_URL");

    if (error) {
      const url = new URL("/login", appBaseUrl);
      url.searchParams.set("error", error.code ?? "authorization_error");
      url.searchParams.set("message", error.message);

      const cause = error.cause as { message?: string } | undefined;
      if (cause?.message) {
        url.searchParams.set("detail", cause.message);
      }

      return NextResponse.redirect(url);
    }

    const returnTo = ctx.returnTo || "/dashboard";
    return NextResponse.redirect(new URL(returnTo, appBaseUrl).toString());
  },
});
