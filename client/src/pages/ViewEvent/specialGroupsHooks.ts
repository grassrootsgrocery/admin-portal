import { useQuery } from "react-query";
import { useAuth } from "../../contexts/AuthContext";
import { ProcessedSpecialGroup } from "../../types";

// Retrieve Special Groups
export function useSpecialGroups() {
  const { token } = useAuth();
  return useQuery(["fetchSpecialGroups"], async () => {
    const response = await fetch(`/api/special-groups`, {
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
