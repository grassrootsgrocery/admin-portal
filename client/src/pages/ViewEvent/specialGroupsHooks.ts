import { useQuery } from "react-query";
import { useAuth } from "../../contexts/AuthContext";
import { API_BASE_URL } from "../../utils/http";
import { ProcessedSpecialGroup } from "../../types";

// Retrieve Special Groups
export function useSpecialGroups() {
  const { token } = useAuth();
  return useQuery(["fetchSpecialGroups"], async () => {
    const response = await fetch(`${API_BASE_URL}/api/special-groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message);
    }
    return response.json() as Promise<ProcessedSpecialGroup[]>;
  });
}
