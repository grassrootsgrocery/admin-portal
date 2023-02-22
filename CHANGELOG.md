# Fall 2022 UMD Hack4Impact

- Created UI using React, TypeScript
- Created Express REST API to act as intermediary between Airtable and our frontend
- Set up build scripts
- Set up hosting using [Railway](https://railway.app/)

## Authentication

- Set up simple authentication using Express, bcrypt, and local storage.
- Put encrypted credentials in **Users** table in Airtable.
- Created endpoints for signing in and for creating new users
- Created UI for signing in

## Messaging

- Created UI components and endpoints for interfacing with [Make](https://www.make.com/) in order to display text messages that are triggered during automations
- Created endpoints that trigger Make text message automations. Wired up buttons on frontend to hit these endpoints

## Events

- Created button that links to event creation form
- Fetched all upcoming events from Airtable and displayed them in the UI
- Added a static date variable to set `TODAY` via environment variable when `NODE_ENV` is `'dev'`

## Volunteers

- Fetched and displayed all volunteers in a table for each event
- Added functionality for confirming and unconfirming of volunteers for each event
- Added functionality for marking and unmarking each volunteer as "Can't come"
- Allowed sorting of volunteers based on type, confirmation status, special group, etc.

## Special Groups

- Created endpoints and UI elements for the creation of new groups as well as adding groups to an event
- Fetched and displayed event sign up link in the UI for each special group

## Drivers

- Fetched and displayed drivers for each event
- Added functionality for assigning drivers to certain dropoff locations

## Dropoff Locations

- Added functionality for adding a dropoff location to an event

## Forms

- Added dropdown component that links to commonly-used forms (Attendance form, driver form, and food allocation form).
