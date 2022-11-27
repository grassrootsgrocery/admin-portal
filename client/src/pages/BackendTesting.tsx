import { useEffect, useState } from "react";
import { API_BASE_URL } from "../httpUtils";

export function BackendTesting() {
  const [data, setData] = useState();
  const fetchData = async () => {
    try {
      const resp = await fetch(`${API_BASE_URL}/api/messaging`); //IDK why the proxy isn't working
      const data = await resp.json();
      console.log(data);
      setData(data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <div>Backend Testing</div>
    </div>
  );
}
