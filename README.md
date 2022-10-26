# Grassroots Groceries Events Portal

# Project Info

[Grassroots Groceries](https://www.grassrootsgrocery.org/) (previously Mott Haven Fridge) is an organization founded by Dan Zauderer that delivers free produce to areas that need it in NYC. The organization hosts produce-packing events every Saturday, where volunteers come to a designated location and load produce into vehicles. Volunteers then drive the vehicles to various dropoff locations.

Currently, Grassroot's technical infrastructure for managing all their volunteers' and coordinators' data is a hodgepodge
of different services wired together (main ones are [Airtable](https://airtable.com/), [Twilio](https://www.twilio.com/), [Make](https://www.make.com/), [Front](https://front.com/), and [Jotform](https://www.jotform.com/)). Dan uses these technologies to keep track of people who register for events, schedule events, send text messages to people to remind them of events, and much more. Because the system is so [ad hoc](https://en.wikipedia.org/wiki/Ad_hoc), it is very difficult for anyone besides Dan to use it. Dan would like a web app that brings together all of these services together into an easy-to-use portal.

# Running the dev server

1. Clone the repo and `cd` into it
2. Run `npm install`
3. Run `npm run dev`
4. Navigate to `localhost:5173` in your browser

# API Key Management and Access

## How to get the API key for development

Go to [https://airtable.com/account](https://airtable.com/account). Sign in with the Mott Haven Fridge credentials. Copy the API key from the field.

## Using the API key in your code to make calls to Airtable

In order to access the Grassroots Groceries Airtable database, you need the API key for the Mott Haven Fridge Airtable account.
After obtaining the key, create a `.env` file in the root of the project directory (in the same directory as `src`, but _not_ in the `src` directory). In the `.env` file, declare a variable called `VITE_AIRTABLE_API_KEY` and set it equal to the
Airtable API key (`VITE_AIRTABLE_API_KEY=<Whatever your key is>`).

Inside of your JavaScript/TypeScript code, in order to access the key, do

```TypeScript
const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
```

# Tech Resources

The stack is currently TypeScript, React, and Airtable, with [Vite](https://vitejs.dev/guide/) as our build tool.

## Data fetching and React Query

In order to simplify our calls to the Airtable API, we decided to use [React Query](https://react-query-v3.tanstack.com/) to handle the data fetching layer of our app. While introducing libraries to the codebase does add complexity, we believe that the tradeoff in this case is worth it due to the benefits of caching, client/server
synchronization, and state management that React Query provides. Here is a short primer.

## Making a fetch call

The vanilla way to fetch data in React is usually something like this:

```TypeScript
function MyComponent() {
  const [data, setData] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  const fetchData = async (url) => {
    setLoading(true);
    try {
      const resp = await fetch(url);
      const data = await resp.json();
      setData(data);
    } catch (error) {
      setError(error);
    }
    setLoading(false);
  }
  useEffect(() => fetchData("https://someurl.com"), []);

}
```

Using React Query, the same fetch call would be written like this instead.

```TypeScript
import { useQuery } from "react-query";


const { data, status, error } = useQuery(["thisIsTheQueryKey"], async () => {
    const resp = await fetch("https://someurl.com");
    return resp.json();
});
```

Let's break down the code above. The `useQuery` hook takes in an array of strings as its first argument. The elements of this array collectively make up the **query key** of this particular `useQuery` call.
We'll talk more about the query key in a bit, but know that it should be unique to this useage of `useQuery`. The second argument our fetching function. `useQuery` returns an object that has a `data` attribute, which stores the result of the fetch, `status`, which stores the status of the fetch (`"loading"`, `"idle"`, `"success"`, or `"error"`), and `error`, which stores errors thrown from the fetch.

<!-- For the `status` variable, `"loading"` and `"idle"` are the same thing (`"idle"` has been removed in future versions of React Query). -->

So what's the big deal? Why is this better than the vanilla way of fetching? Aside from being shorter and more concise, React Query does a bunch of stuff under the hood for us that we would rather not have to think about (caching, deduping requests, refetching on error, etc.). One thing that we care about in particular is caching.
Because React Query automatically caches the results of requests on the client, we can use the cache as a way to share the data we get back from requests throughout our application.
This is where the query key comes into play. If you imagine the cache as a hash map, the query key is the key that lets you index into the map and get the cached data. After the first time the request above is made successfully, the cache looks like

```TypeScript
const cache = {
  "thisIsTheQueryKey": //The data that was returned from the fetch
}
```

This means that subsequent calls to `useQuery` with the same query key and fetch function will first read from the cache before making the request, which means that our data can be displayed _instantly_. This also means that if we have code that looks like this:

```TypeScript
import { useQuery } from "react-query";

/*

What our cache looks like...

const cache = {
  "thisIsTheQueryKey": //The data that was returned from the fetch
}

*/


function ComponentA() {
  const { data, status, error } = useQuery(["thisIsTheQueryKey"], async () => {
      const resp = await fetch("https://someurl.com");
      return resp.json();
  });

}

// Somewhere else in our app...
function ComponentB() {
  const { data, status, error } = useQuery(["thisIsTheQueryKey"], async () => {
      const resp = await fetch("https://someurl.com");
      return resp.json();
  });
}
```

Both `ComponentA` and `ComponentB` read from and populate the same cache, which makes it really easy for us to share that data between them.

## React Query Dev Tools

React Query also comes with developer tools that make it easy to debug requests. In order to enable these tools, you need to set this environment variable in your `.env` file: `VITE_NODE_ENV='development'`.

## More resources

Below are also linked some more resources about React Query for further edification.

### Videos

- [React Query in 100 Seconds](https://www.youtube.com/watch?v=novnyCaa7To) - If you are in a hurry. His other 100 second videos about other tech are really good too.
- [React Query Demo from the creator](https://www.youtube.com/watch?v=seU46c6Jz7E) - A nice demo with a bit of talk about the library in the beginning.
- [React Query Crash Course](https://www.youtube.com/watch?v=NQULKpW6hK4) - Video going through a practical project that is reasonably short.

### Guides and Docs

- [The Practical React Query guide](https://tkdodo.eu/blog/practical-react-query) - A very thorough guide for those interested.
- [React Query official docs](https://react-query-v3.tanstack.com/) - Official docs.

## TypeScript

TypeScript is safer than JavaScript, most UMD Hack4Impact teams use TypeScript, and TypeScript experience looks better on your resume than JavaScript experience. For these reasons, we've decided to use TypeScript in this project.

\* VSCode tip: If you hover over a type, VSCode will show you the type. If you press `Ctrl` (`Cmd` on Mac?) while hovering, VSCode will show you more information about that type (such as its properties).
