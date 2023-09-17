const express = require("express");
const axios = require("axios");
const OpenAI = require("openai");

const { formatTime } = require("./utils/dateUtils");
const { capitalizeFirstLetter } = require("./utils/stringUtils");

require("dotenv").config();

const app = express();
const PORT = 3000;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_KEY,
});

app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
	try {
		const ipAddress = await getIPAddress();
		const city = await getCity(ipAddress);
		const currentDatetime = await getLocalTime(ipAddress);
		const weatherDetails = await getWeather(city);
		const requestBody = {
			model: "gpt-3.5-turbo",
			messages: [
				{
					role: "system",
					content:
						"You will be provided with the city name, local time, and weather details ('description' and 'feels like') of a user. \n\nUsing the given input I want you to recommend at least 10 songs that would fit the time, place, and weather. \n\nFor example, if the time was 7:30AM and sunny weather, you should recommend songs that would make someone feel excited to get the day started and woken up. Additionally, if the city was Paris, it would make sense for the song recommendations to be french.\n\nThe output of your response should be in the format of JSON. The JSON should contain only 'title' and 'artist' keys.\n\n", // truncated for brevity
				},
				{
					role: "user",
					content: `{"city":"${city}","currentDatetime":"${currentDatetime}","weatherDetails":{"description":"${weatherDetails.description}","feels_like":${weatherDetails.feels_like}}}`,
				},
			],
			temperature: 1,
			max_tokens: 2048,
			top_p: 1,
			frequency_penalty: 0,
			presence_penalty: 0,
		};

		const openaiResponse = await openai.chat.completions.create(
			requestBody
		);

		// Debugging
		// console.log(
		// 	"Sending the following request body to OpenAI:",
		// 	requestBody
		// );
		// console.log("OpenAI Response Choices:", openaiResponse.choices[0]);

		const responseContent = openaiResponse.choices[0]?.message?.content;

		// Transform data to be more readable
		const formattedTime = formatTime(currentDatetime);
		const capitalizedWeatherDescription = capitalizeFirstLetter(
			weatherDetails.description
		);

		res.render("songs", {
			city: city,
			time: formattedTime,
			weatherDescription: capitalizedWeatherDescription,
			feelsLike: weatherDetails.feels_like,
			songs: JSON.parse(responseContent).songs,
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

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

async function getIPAddress() {
	try {
		const ipifyResponse = await axios.get(
			"https://api.ipify.org?format=json"
		);
		return ipifyResponse.data.ip;
	} catch (error) {
		error.service = "IP Address Retrieval";
		throw error;
	}
}
async function getCity(ipAddress) {
	try {
		const ipstackResponse = await axios.get(
			`http://api.ipstack.com/${ipAddress}?access_key=${process.env.IPSTACK_KEY}`
		);
		return ipstackResponse.data.city;
	} catch (error) {
		error.service = "City Retrieval";
		throw error;
	}
}

async function getLocalTime(ipAddress) {
	try {
		const worldTimeResponse = await axios.get(
			`http://worldtimeapi.org/api/ip/${ipAddress}.txt`
		);
		const datetimeLine = worldTimeResponse.data
			.split("\n")
			.find((line) => line.startsWith("datetime:"));
		return datetimeLine ? datetimeLine.split(": ")[1] : null;
	} catch (error) {
		error.service = "Local Time Retrieval";
		throw error;
	}
}

async function getWeather(city) {
	try {
		const weatherResponse = await axios.get(
			`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.OPENWEATHER_KEY}&units=metric`
		);
		return {
			description: weatherResponse.data.weather[0].description,
			feels_like: weatherResponse.data.main.feels_like,
		};
	} catch (error) {
		error.service = "Weather Data Retrieval";
		throw error;
	}
}
