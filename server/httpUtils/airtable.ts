/*
"Base" is Airtable lingo for database. 
So this "base id" is the id for the Grassroots Groceries Airtable database.
*/
const AIRTABLE_BASE_ID_PROD = process.env.AIRTABLE_BASE_ID_PROD
const AIRTABLE_BASE_ID_DEV = process.env.AIRTABLE_BASE_ID_DEV
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
