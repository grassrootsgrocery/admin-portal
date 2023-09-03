import { useAuth } from "../contexts/AuthContext";

export const applyPatch =
  (url: string, body: any, token: string) => async () => {
    const resp = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!resp.ok) {
      const data = await resp.json();
      throw new Error(data.message);
    }
    return resp.json();
  };
