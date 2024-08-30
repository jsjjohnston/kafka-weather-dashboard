import { Kafka } from "kafkajs";
import dotenv from "dotenv";
import { Client } from "pg";

dotenv.config();

const kafka = new Kafka({
    clientId: "weather-consumer",
    brokers: [process.env.KAFKA_BROKER as string],
});

const consumer = kafka.consumer({ groupId: "weather-group" });
const weatherTopic = process.env.KAFKA_TOPIC as string;

// PostgreSQL client setup
const pgClient = new Client({
    user: "kafkauser",
    host: "localhost",
    database: "weatherdb",
    password: "kafkapassword",
    port: 5432,
});

// Function to create the table if it doesn't exist
const createTableIfNotExists = async () => {
    const createTableQuery = `
  CREATE TABLE IF NOT EXISTS weather_data (
    id SERIAL PRIMARY KEY,
    city VARCHAR(50),
    temperature FLOAT,
    humidity INTEGER,
    weather_description VARCHAR(100),
    date_time BIGINT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;

    try {
        await pgClient.query(createTableQuery);
        console.log("Checked/Created weather_data table in PostgreSQL");
    } catch (error) {
        console.error(
            "Error creating weather_data table in PostgreSQL:",
            error,
        );
    }
};

pgClient
    .connect()
    .then(async () => {
        console.log("Connected to PostgreSQL");
        await createTableIfNotExists(); // Ensure the table exists
    })
    .catch((err) => {
        console.error("Failed to connect to PostgreSQL", err);
        process.exit(1); // Exit if connection fails
    });

// Function to save weather data to PostgreSQL
const saveWeatherData = async (weatherData: any) => {
    const query = `
  INSERT INTO weather_data (city, temperature, humidity, weather_description, date_time)
  VALUES ($1, $2, $3, $4, $5)
  `;
    const values = [
        weatherData.name,
        weatherData.main.temp,
        weatherData.main.humidity,
        weatherData.weather[0].description,
        weatherData.dt,
    ];

    try {
        console.log("Weather data to PostgreSQL", values);
        await pgClient.query(query, values);
        console.log("Weather data saved to PostgreSQL:", values);
    } catch (error) {
        console.error("Error saving weather data to PostgreSQL:", error);
    }
};

// Function to consume weather data from Kafka
const consumeWeatherData = async () => {
    await consumer.connect();
    console.log("Consumer connected to Kafka");

    await consumer.subscribe({ topic: weatherTopic, fromBeginning: true });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const weatherData = JSON.parse(message.value!.toString());
            console.log("Received weather data:", weatherData);
            await saveWeatherData(weatherData); // Save to PostgreSQL
        },
    });
};

consumeWeatherData().catch(console.error);
