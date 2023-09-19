// Required modules and services
const express = require("express");
const OpenAI = require("openai");
const spotifyService = require("./spotifyService");
const {
	getIPAddress,
	getCity,
	getLocalTime,
	getWeather,
} = require("./utils/apiCalls");

// Utility functions for date and string manipulation
const { formatTime } = require("./utils/dateUtils");
const { capitalizeFirstLetter } = require("./utils/stringUtils");

// Load environment variables from .env file
require("dotenv").config();

const app = express();
const PORT = 3000;

// Initialize OpenAI with API key from environment variables
const openai = new OpenAI({
	apiKey: process.env.OPENAI_KEY,
});

// Middleware to serve static files from 'public' directory
app.use(express.static("public"));
// Setting EJS as the view engine for rendering pages
app.set("view engine", "ejs");

// Root route to fetch and display song recommendations
app.get("/", async (req, res) => {
	try {
		// Fetch IP address, city, local time, and weather details
		const ipAddress = await getIPAddress();
		const city = await getCity(ipAddress);
		const currentDatetime = await getLocalTime(ipAddress);
		const weatherDetails = await getWeather(city);

		// Convert the 'currentDatetime' using your utility function
		const formattedTime = formatTime(currentDatetime);

		// Constructing the input in a  clear format for better output (recommendations)
		const openaiInput = `${city}, ${formattedTime}, ${
			weatherDetails.description
		}, feels like ${Math.round(weatherDetails.feels_like)} degrees`;

		// Configure request body for OpenAI API call
		const requestBody = {
			model: "gpt-3.5-turbo-16k",
			messages: [
				{
					role: "system",
					content:
						"You will be provided with a city name, local time, and weather details ('description' and 'feels like') of a user. Based on this information, please recommend at least 10 songs that relate to the time, place, and weather. The output should be in JSON format, containing an array named 'songs', where each entry is an object with 'title' and 'artist' keys. For example: `\"songs\": [{\"title\": \"Song Name\", \"artist\": \"Artist Name\"}, ...]`.",
				},
				{
					role: "user",
					content: openaiInput,
				},
			],
			temperature: 1,
			max_tokens: 1024,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		};

		// Make API call to OpenAI
		const openaiResponse = await openai.chat.completions.create(
			requestBody
		);

		// Log the request and response for debugging purposes
		console.log(
			"Sending the following request body to OpenAI:",
			requestBody
		);
		console.log("OpenAI Response Choices:", openaiResponse.choices[0]);

		// Extract song recommendations from OpenAI response
		const responseContent = openaiResponse.choices[0]?.message?.content;

		// Replacing inner double quotes with escaped quotes
		const sanitizedContent = responseContent.replace(
			/"([^"]+)"/g,
			(match, innerContent) => {
				return `"${innerContent.replace(/"/g, '\\"')}"`;
			}
		);

		// Parsing the sanitized JSON
		const songsFromOpenAI = JSON.parse(sanitizedContent).songs;

		// Collect Spotify URLs for the songs
		const songsWithSpotifyLinks = [];
		for (const song of songsFromOpenAI) {
			const trackData = await spotifyService.getSpotifyData(
				`search?q=${song.title}&type=track&limit=1`
			);
			const trackURL =
				trackData?.tracks?.items[0]?.external_urls?.spotify;
			songsWithSpotifyLinks.push({
				title: song.title,
				artist: song.artist,
				url: trackURL,
			});
		}

		// Transform data to be more readable
		const capitalizedWeatherDescription = capitalizeFirstLetter(
			weatherDetails.description
		);

		// Render the songs page with fetched data
		res.render("songs", {
			city: city,
			time: formattedTime,
			weatherDescription: capitalizedWeatherDescription,
			feelsLike: weatherDetails.feels_like,
			songs: songsWithSpotifyLinks,
		});
	} catch (error) {
		if (error.service) {
			// check if the error object has a 'service' property
			console.error(`Error with ${error.service}:`, error.message);
			res.status(500).send(`Error with ${error.service}`);
		} else {
			console.error("Full error details:", error);
			res.status(500).send("Internal Server Error");
		}
	}
});

// Start the server and authenticate with Spotify
app.listen(PORT, async () => {
	console.log(`Server running on http://localhost:${PORT}`);
	await spotifyService.authenticateWithSpotify();
});
