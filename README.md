# Grassroots Groceries (previously Mott Haven Fridge) Events Portal

## Running dev server

1. Clone the repo and `cd` into it
2. Run `npm install`
3. Run `npm run dev`
4. Navigate to `localhost:5173` in your browser

## API Key Management and Access

In order to access the Grassroots Groceries events portal, you need the API key the Mott Haven Fridge Airtable account.
After obtaining the key, create a `.env` file in the root of the project directory (in the same directory as `src`, but NOT in the `src` directory). In the `.env` file, declare a variable called `VITE_AIRTABLE_API_KEY` and set it equal to the
Airtable API key (`VITE_AIRTABLE_API_KEY=<Whatever your key is>`).

Inside of your JavaScript/TypeScript code, in order to access the key, do 

```JavaScript
const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
```
