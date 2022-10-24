/*
"Base" is Airtable lingo for database. 
So this "base id" is the id for the Mott Haven Fridge/Grassroots Groceries Airtable database.
*/
const AIRTABLE_BASE_ID = "app7zige4DRGqIaL2";

//"Base" here just has the normal definition
export const AIRTABLE_URL_BASE = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

//Generic fetch call to Airtable
const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
export const fetchAirtableData = async (url) => {
  console.log("Fetching...");
  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.json();
  } catch (error) {
    console.log(error);
  }
};
