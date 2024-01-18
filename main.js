const express = require('express');
const socketIo = require('socket.io');
const kafka = require('kafka-node');
const path = require('path');
require('dotenv').config();

const kafkaHost = process.env.KAFKA_BROKER || 'localhost:9092';

const app = express();
const server = app.listen(3000, () => {
    console.log('WebSocket server listening on *:3000');
});
const io = socketIo(server);

// Kafka Consumer
const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: kafkaHost });
const topics = [
    { topic: 'temperature' },
    { topic: 'motion' },
    { topic: 'door' },
    { topic: 'vibration' },
    { topic: 'sound' },
    { topic: 'humidity' },
];
const options = { autoCommit: true, groupId: 'web-interface-group' };
const consumer = new Consumer(client, topics, options);

// In-memory array to temporarily store unread events
let unreadEventsBuffer = [];

app.use(express.static(path.join(__dirname, 'public')));

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('A user connected');

    // Send unread events to the connected user
    unreadEventsBuffer.forEach((unreadEvent) => {
        socket.emit('event', unreadEvent);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Handle incoming events from Kafka consumers
consumer.on('message', (message) => {
    // Emit the event to connected users
    io.emit('event', message.value);
    console.log(message.value);

    // Store the event in the in-memory buffer
    unreadEventsBuffer.push(message.value);
});

// Handle errors from Kafka consumer
consumer.on('error', (error) => {
    console.error('Kafka consumer error:', error);
});

// Gracefully handle server shutdown
process.on('SIGINT', () => {
    console.log('Server shutting down');
    // Add any cleanup logic here
    process.exit();
});
