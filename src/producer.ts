import { Kafka } from "kafkajs";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
    clientId: "weather-producer",
    brokers: [process.env.KAFKA_BROKER as string],
});

const producer = kafka.producer();
const weatherTopic = process.env.KAFKA_TOPIC as string;

// Function to fetch weather data from OpenWeather API
const fetchWeatherData = async () => {
    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=Melbourne,AU&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`,
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching weather data:", error);
        return null;
    }
};

// Function to send weather data to Kafka
const sendWeatherDataToKafka = async () => {
    await producer.connect();
    console.log("Producer connected to Kafka");

    setInterval(async () => {
        const weatherData = await fetchWeatherData();
        if (weatherData) {
            await producer.send({
                topic: weatherTopic,
                messages: [{ value: JSON.stringify(weatherData) }],
            });
            console.log("Weather data sent to Kafka:", weatherData);
        }
    }, 60000); // Fetch and send data every 60 seconds
};

sendWeatherDataToKafka().catch(console.error);
