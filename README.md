# Song Recommendation Engine 🎶

This web application leverages the power of OpenAI and Spotify's APIs to provide song recommendations. Based on the user's location, local time, and current weather conditions, our engine crafts a playlist to match the mood.

## Features

-   Automatically detects the user's city and local time.
-   Fetches the current weather conditions for the detected city.
-   Recommends songs that relate to the time, place, and weather.
-   Provides Spotify links for each recommended song.

## Installation and Setup

##### 1. Clone the Repository

```
git clone https://github.com/yourusername/song-rec.git
cd song-rec
```

##### 2. Install Dependencies

`npm install`

##### 3. Environment Variables

Create a .env file in the root directory and add the following:

```
OPENAI_KEY=your_openai_key
IPSTACK_KEY=your_ipstack_key
OPENWEATHER_KEY=your_openweather_key
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_SECRET_KEY=your_spotify_secret_key
```

##### 4. Start the Server

`npm start`

Visit http://localhost:3000 in your browser to view the application.

## Dependencies

Express: For setting up the server.
Axios: For making HTTP requests.
EJS: As a template engine.
OpenAI: To interact with OpenAI's API.
