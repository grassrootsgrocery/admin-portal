import { useEffect } from "react";

export function BackendTesting() {
  const fetchData = async () => {
    try {
      const resp = await fetch("http://localhost:5000/api/messaging"); //IDK why the proxy isn't working
      const data = await resp.json();
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return <div>Backend Testing</div>;
}
