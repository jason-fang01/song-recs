function formatTime(datetime) {
	const timePart = datetime.split("T")[1];
	let [hour, minute] = timePart.split(":");

	hour = parseInt(hour, 10);

	const ampm = hour >= 12 ? "PM" : "AM";

	hour %= 12;
	hour = hour ? hour : 12; // if hour is 0, it should be 12

	const strTime = `${hour}:${minute} ${ampm}`;
	return strTime;
}

module.exports = {
	formatTime,
};
