/*
"Base" is Airtable lingo for database. 
So this "base id" is the id for the Mott Haven Fridge/Grassroots Groceries Airtable database.
*/
const AIRTABLE_BASE_ID_PROD = "app7zige4DRGqIaL2";
const AIRTABLE_BASE_ID_DEV = "app18BBTcWqsoNjb2";
//"Base" here just has the normal definition
export const AIRTABLE_URL_BASE = `https://api.airtable.com/v0/${
  import.meta.env.VITE_NODE_ENV === "development"
    ? AIRTABLE_BASE_ID_DEV
    : AIRTABLE_BASE_ID_PROD
}`;

//Generic fetch call to Airtable
const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
export const fetchAirtableData = async <T>(url: string) => {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  return response.json() as T;
};
