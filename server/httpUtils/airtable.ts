import { logger } from "../loggerUtils/logger";
import { AirtableRecord, AirtableResponse } from "../types";
import { fetch } from "./nodeFetch";
/*
"Base" is Airtable lingo for database. 
So this "base id" is the id for the Grassroots Grocery Airtable database.
*/
const AIRTABLE_BASE_ID_PROD = process.env.AIRTABLE_BASE_ID_PROD;
const AIRTABLE_BASE_ID_DEV = process.env.AIRTABLE_BASE_ID_DEV;
//"Base" here just has the normal definition
export const AIRTABLE_URL_BASE = `https://api.airtable.com/v0/${
  process.env.NODE_ENV === "production"
    ? AIRTABLE_BASE_ID_PROD
    : AIRTABLE_BASE_ID_DEV
}`;

/* Because I'm not sure that we want to display error messages from Airtable on the client, this is the 
default error message that we will use when a request to Airtable fails
*/
export const AIRTABLE_ERROR_MESSAGE =
  "There was a problem fetching data from Airtable";

export async function airtableGET<T>({ url }: { url: string }) {
  return airtableFetch<T>({ url: url, method: "GET", body: {} });
}

export async function airtablePOST<T>({
  url,
  body,
}: {
  url: string;
  body: object;
}) {
  return airtableFetch<T>({ url: url, method: "POST", body: body });
}

export async function airtablePATCH<T>({
  url,
  body,
}: {
  url: string;
  body: object;
}) {
  return airtableFetch<T>({ url: url, method: "PATCH", body: body });
}

export async function airtablePUT<T>({
  url,
  body,
}: {
  url: string;
  body: object;
}) {
  return airtableFetch<T>({ url: url, method: "PUT", body: body });
}

type HttpVerb = "GET" | "POST" | "PUT" | "PATCH"; //Add more as needed...
async function airtableFetch<T>({
  url,
  method,
  body,
}: {
  url: string;
  method: HttpVerb;
  body: object;
}): Promise<AirtableResponse<T>> {
  let resp = null;
  if (method === "GET") {
    resp = await fetch(url, {
      method: method,
      headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` },
    });
  } else {
    resp = await fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }
  if (!resp.ok) {
    const data = await resp.json();
    logger.error("Airtable response: ", data);
    return { kind: "error", error: data };
  }

  return {
    kind: "success",
    records: (await resp.json()).records as AirtableRecord<T>[],
  };
}
