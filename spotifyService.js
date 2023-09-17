const axios = require("axios");

let spotifyAccessToken = null;

async function authenticateWithSpotify() {
	try {
		const response = await axios({
			method: "post",
			url: "https://accounts.spotify.com/api/token",
			headers: {
				Authorization:
					"Basic " +
					new Buffer(
						`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
					).toString("base64"),
				"Content-Type": "application/x-www-form-urlencoded",
			},
			data: "grant_type=client_credentials",
		});

		spotifyAccessToken = response.data.access_token;
	} catch (error) {
		console.error("Error authenticating with Spotify:", error);
	}
}

async function getSpotifyData(endpoint) {
	try {
		if (!spotifyAccessToken) {
			await authenticateWithSpotify();
		}

		const response = await axios({
			method: "get",
			url: `https://api.spotify.com/v1/${endpoint}`,
			headers: {
				Authorization: `Bearer ${spotifyAccessToken}`,
			},
		});

		return response.data;
	} catch (error) {
		console.error("Error getting data from Spotify:", error);
	}
}

module.exports = {
	authenticateWithSpotify,
	getSpotifyData,
};
