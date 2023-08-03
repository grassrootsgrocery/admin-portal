import { useAuth } from "./contexts/AuthContext";

//Because I couldn't figure out why the 'proxy' in the package.json wasn't working.
export const API_BASE_URL = import.meta.env.VITE_SERVER_URL || "";

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
