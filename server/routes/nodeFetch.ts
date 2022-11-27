// ✅ Do this if using TYPESCRIPT
import { RequestInfo, RequestInit } from "node-fetch";

export const fetch = (url: RequestInfo, init?: RequestInit) =>
  import("node-fetch").then(({ default: fetch }) => fetch(url, init));
