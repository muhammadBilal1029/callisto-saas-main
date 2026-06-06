type TokenCache = {
  accessToken: string;
  expiresAt: number;
};

let cache: TokenCache | null = null;

function requireMgmtEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name}. Create a Machine-to-Machine app authorized for the Auth0 Management API.`,
    );
  }
  return value;
}

export async function getAuth0ManagementToken(): Promise<string> {
  if (cache && Date.now() < cache.expiresAt - 60_000) {
    return cache.accessToken;
  }

  const domain = requireMgmtEnv("AUTH0_DOMAIN");
  const clientId =
    process.env.AUTH0_MGMT_CLIENT_ID ?? process.env.AUTH0_CLIENT_ID;
  const clientSecret =
    process.env.AUTH0_MGMT_CLIENT_SECRET ?? process.env.AUTH0_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Set AUTH0_MGMT_CLIENT_ID and AUTH0_MGMT_CLIENT_SECRET (M2M app for Management API).",
    );
  }

  const response = await fetch(`https://${domain}/oauth/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${domain}/api/v2/`,
      grant_type: "client_credentials",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Auth0 Management API token request failed: ${body}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  cache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return cache.accessToken;
}
