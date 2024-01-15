const express = require('express');
// const http = require('http');
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
];
const options = { autoCommit: true, groupId: 'web-interface-group' };
const consumer = new Consumer(client, topics, options);

app.use(express.static(path.join(__dirname, 'public')));

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

