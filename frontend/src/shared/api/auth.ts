import { API_URL } from "./base";

function getTokens() {
  return {
    access: localStorage.getItem("access"),
    refresh: localStorage.getItem("refresh"),
  };
}

function setTokens(access: string, refresh?: string) {
  localStorage.setItem("access", access);
  if (refresh) {
    localStorage.setItem("refresh", refresh);
  }
}

async function refreshAccessToken(refresh: string) {
  const res = await fetch(`${API_URL}/api/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await res.json();
  setTokens(data.access); 
  return data.access;
}

export async function apiFetchAuth<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  let access = token;

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${access}`,
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    const { refresh } = getTokens();
    if (refresh) {
      try {
        access = await refreshAccessToken(refresh);

        const retry = await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            Authorization: `Bearer ${access}`,
          },
          cache: "no-store",
        });
        if (!retry.ok) throw new Error(`API ${retry.status}: ${await retry.text()}`);
        return retry.json();
      } catch (err) {
        throw new Error("Session expired. Please login again.");
      }
    }
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json();
}
