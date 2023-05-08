# Grassroots Groceries Events Portal
<img src="https://user-images.githubusercontent.com/15386131/236855253-45375899-57e4-4b8d-bb06-1f3728fb5b0f.png" width=500 align=right>
<img src="https://user-images.githubusercontent.com/15386131/236855570-d6079578-947c-4145-bd67-102005ca550b.png" width=500 align=right>

# Point of Contact

For inquiries about the project or if you want to contribute as a developer, contact Dan Zauderer (dan@grassrootsgrocery.org) or Matt Sahn (matt@grassrootsgrocery.org). We are always looking for people that want to contribute their coding skills to this project!

# Project Info

[Grassroots Grocery](https://www.grassrootsgrocery.org/) is an organization founded by Dan Zauderer that delivers free produce to areas that need it in NYC. The organization hosts produce-packing events every Saturday, where volunteers come to a designated location and load produce into their personal vehicles. Volunteers then drive the vehicles to various community locations around NYC.

Currently, Grassroot's technical infrastructure for managing all their volunteers' and coordinators' data is a collection
of different services wired together (main ones are [Airtable](https://airtable.com/), [Twilio](https://www.twilio.com/), [Make](https://www.make.com/), [Front](https://front.com/), and [Jotform](https://www.jotform.com/)). Grassroots Grocery uses these technologies to keep track of people who register for events, schedule events, send text messages to people to remind them of events, and much more. Because the system is so [ad hoc](https://en.wikipedia.org/wiki/Ad_hoc), it is very difficult for anyone besides Dan to use it. This project is to build a web app that brings together all of these services together into an easy-to-use portal that will allow multiple people to organize and run events. Ultimately, it will allow for scaling out the operations of Grassroots Grocery to more sites around NYC and beyond.

This application started as a semester-long project by students at University of Maryland as part of [Hack4Impact](https://hack4impact.org/).

# The stack

- Our frontend is currently TypeScript, React, and Tailwind CSS, with [Vite](https://vitejs.dev/guide/) as our build tool.
- Our backend is currently TypeScript and Express.
- Our database is Airtable because this is what Grassroots Groceries is using to store their data currently.
- Make is a service used for triggering automations. Grassroots Groceries uses it to send automated text messages and emails to volunteers and coordinators. The automations have been built out by the GG Platform Engineering team, and we only need to trigger them on our backend.

Here is a current diagram of what the infrastructure for the project currently looks like.
<img src="https://github.com/grassrootsgrocery/admin-portal/raw/main/infrastructure-diagram.png" width=700>

# .env files

There are two `.env` files in the project: `.env` in the root of the project and `client/.env`.

- `.env` is for the backend of our application and holds all of our API keys to the different services that we
  need to interact with (currently, just Airtable and Make).
- `client/.env` is for the frontend of the application, and it is only used for development purposes. In order to run the dev server for this project, you must add `VITE_SERVER_URL='http://localhost:5000'`to this file.

# API Key Access & Management

## How to get the API key for development

### Airtable

- Contact Matt and Dan to have them provide you with an Airtable API key to a development database and the AIRTABLE_BASE_ID_DEV value for it.
- Go to the root `.env` of the project and add the line `AIRTABLE_API_KEY=<Whatever the key is>`
- Go to the root `.env` of the project and add the line `AIRTABLE_BASE_ID_DEV=<Whatever the key base ID is>`

### Make

- NOTE: You don't need the Make API key to do development, but just know that the production deploy of the app does have this API key
- Contact Matt and Dan to have them provide you with a Make API key.
- Go to the root `.env` of the project and add the line `MAKE_API_KEY=<Whatever the key is>`

## Using the API keys

### Backend

Access your API keys and env variables on the backend like this:

```TypeScript
process.env.MAKE_API_KEY
process.env.AIRTABLE_API_KEY
process.env.AIRTABLE_BASE_ID_PROD
process.env.AIRTABLE_BASE_ID_DEV
```

# Running the dev server

1.  Clone the repo and `cd` into it
2.  Run `npm install` in the root directory
3.  Run `npm install` in the `client/` directory
4.  Follow the steps in the section above to set up your API keys (**API Key Access & Management**)
5.  Add to the root `.env` file:

        JWT_SECRET=96024
        TODAY=<YYYY-MM-DD>
        NODE_ENV=dev
        AIRTABLE_BASE_ID_DEV=<dev base ID>
        AIRTABLE_API_KEY=<your airtable API key>

    _i.e. `TODAY=2023-02-01`_

6.  Add `VITE_SERVER_URL='http://localhost:5000'`to your `client/.env` file
7.  Run `npm run dev` in the root directory
8.  Navigate to `localhost:5173` in your browser
9.  Log in with username **grassroots** and password **mypassword**

# Hosting

We are currently using [Railway](https://railway.app/) as our hosting solution. You can see a dev deployment of the application at [https://portal.grassrootsgrocery.org/](https://portal.grassrootsgrocery.org/)

# Tech Resources

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
The second argument is our fetching function. `useQuery` returns an object that has a `data` attribute, which stores the result of the fetch, `status`, which stores the status of the fetch (`"loading"`, `"idle"`, `"success"`, or `"error"`), and `error`, which stores errors thrown from the fetch. For the `status` variable, `"loading"` and `"idle"` are the same thing (`"idle"` has been removed in future versions of React Query).

So what's the big deal? Why is this better than the vanilla way of fetching? Aside from being shorter and more concise, React Query does a bunch of stuff under the hood for us that we would rather not have to think about (caching, deduping requests, refetching on error, etc.). One thing that we care about in particular is caching.
Because React Query automatically caches the results of requests on the client, we can use the cache as a way to share the data we get back from requests throughout our application.
This is where the query key comes into play. If you imagine the cache as a hash map, the query key is the key that lets you index into the map and get the cached data. After the first time the request above is made successfully, the cache looks like

```TypeScript
const cache = {
  "thisIsTheQueryKey": //The data that was returned from the fetch
}
```

This means that subsequent calls to `useQuery` with the same query key will first read from the cache before making the request, which means that our data can be displayed _instantly_. This also means that if we have code that looks like this:

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

Both `ComponentA` and `ComponentB` read from and populate the same cache, which makes it really easy for us to share that data between them. Note that because the query key is the key for accessing fetched data in our cache, it should be unique to the fetch function. In other words, you should _not_ have two `useQuery` calls that have the same query key, but different fetch functions.

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

## Styling

### CSS

A few general principles on writing vanilla CSS.

1. All of the colors used in the app are defined as CSS variables in `App.css` so use those when trying to color things.
2. Write semantic HTML. Use things like `section`, `nav`, `footer`, `ol`, `ul`, etc. where they make sense.
3. Dan expects to be able to use the portal on his phone, so try to make the pages responsive. This means that the font size adjust based on the screen size. Use things like `clamp` to assist with this.
4. Favor `rem` instead of `px`, since `rem` is based off of font size.
5. Scope your CSS to avoid your styles being incorrectly applied to other parts of the application. For example, instead of writing `.logo`, write `.navbar .logo`. This ensures that the styles are only applied to the elements with `className="logo"` who are also children of an element with `className="navbar"`. This also can make your CSS more understandable. Writing `.event-card .mid-section .date` is clearer than just writing `.date`.
6. Try to have your CSS rules follow the order in which the CSS elements appear in your markup, like in the example below.

```TSX
function EventCard() {
  return (
    <li className="card">
      <div className="date">
      </div>

      <div className="middle-row">
        <div className="left">
          <div className="mid-section">
          </div>
        </div>
      </div>

      <div className="bottom-row">
        <div className="section">
          <div className="text-label">
          </div>
        </div>
      </div>
    </li>
  );
}
```

```CSS
.card {

}
.card
.date {

}

.card
.middle-row {

}
.card
.middle-row
.left {

}

.card
.bottom-row {

}
.card
.bottom-row
.section {

}
.card
.bottom-row
.section
.text-lable {

}
```

### Tailwind CSS

Because the tech lead on this project can't resist playing with new tech, we decided to use [Tailwind CSS](https://tailwindcss.com/) to aid with our styling. Tailwind was introduced because we wanted a bit more systematic approach to writing CSS. We also wanted something that would help us tackle responsiveness. However, it is not a requirement that things be styled using Tailwind. The codebase is currently a mix of components that are styled with Tailwind and components that are styled with vanilla CSS.

### Tailwind VSCode Extension

This extension is called Tailwind CSS IntelliSense, and you should install it if you plan on using writing Tailwind in this project.

### More resources

- [Official Docs](https://tailwindcss.com/docs/installation)
- [Why Tailwind](https://www.swyx.io/why-tailwind)
- [A nice talk](https://www.youtube.com/watch?v=R50q4NES6Iw)
- [A tweet from Ben Holmes (former Hack4Impact Director of Engineering) probably talking about a Hack4Impact project...](https://twitter.com/BHolmesDev/status/1314036040697610241?s=20)
- [A blog post from Ben Holmes about different CSS frameworks](https://bholmes.dev/blog/understanding-the-spectrum-of-css-frameworks/)
