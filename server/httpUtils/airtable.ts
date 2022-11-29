/*
"Base" is Airtable lingo for database. 
So this "base id" is the id for the Mott Haven Fridge/Grassroots Groceries Airtable database.
*/
const AIRTABLE_BASE_ID_PROD = "app7zige4DRGqIaL2";
const AIRTABLE_BASE_ID_DEV = "app18BBTcWqsoNjb2";
//"Base" here just has the normal definition
export const AIRTABLE_URL_BASE = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID_DEV}`;

/* Because I'm not sure that we want to display error messages from Airtable on the client, this is the 
default error message that we will use when a request to Airtable fails
*/

export const AIRTABLE_ERROR_MESSAGE =
  "There was a problem fetching data from Airtable";
