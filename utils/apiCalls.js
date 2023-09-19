const axios = require("axios");

// Utility function to fetch the IP address
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

// Utility function to fetch the city using an IP address
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

// Utility function to fetch the local time using an IP address
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

// Utility function to fetch weather details using the city name
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

module.exports = {
	getIPAddress,
	getCity,
	getLocalTime,
	getWeather,
};
