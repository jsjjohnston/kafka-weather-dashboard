import { Kafka } from 'kafkajs';
import dotenv from 'dotenv';

dotenv.config();

const kafka = new Kafka({
  clientId: 'weather-consumer',
  brokers: [process.env.KAFKA_BROKER as string],
});

const consumer = kafka.consumer({ groupId: 'weather-group' });
const weatherTopic = process.env.KAFKA_TOPIC as string;

// Function to consume weather data from Kafka
const consumeWeatherData = async () => {
  await consumer.connect();
  console.log('Consumer connected to Kafka');
  
  await consumer.subscribe({ topic: weatherTopic, fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const weatherData = JSON.parse(message.value!.toString());
      console.log('Received weather data:', weatherData);
      // Here, you can process and save the data to a database like PostgreSQL
    },
  });
};

consumeWeatherData().catch(console.error);
