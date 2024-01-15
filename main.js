const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const kafka = require('kafka-node');
require('dotenv').config();  // Load environment variables from .env file

const kafkaHost = process.env.KAFKA_BROKER || 'localhost:9092';

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Kafka Consumer
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: kafkaHost });

const topics = [
    { topic: 'temperature-data' },
    { topic: 'motion-sensor-data' },
    { topic: 'door-sensor-data' },
    { topic: 'vibration-sensor-data' },
];

const options = { autoCommit: true, groupId: 'web-interface-group' };
const consumer = new Consumer(client, topics, options);

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Handle incoming events from Kafka consumers
consumer.on('message', (message) => {

    io.emit('event', message.value);
    console.log(message.value)
});

// Start WebSocket server
server.listen(3000, () => {
    console.log('WebSocket server listening on *:3000');
});
