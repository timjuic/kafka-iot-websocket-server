const express = require('express');
const socketIo = require('socket.io');
const kafka = require('kafka-node');
const path = require('path');
const DatabaseManager = require('./database/database-manager')
const FilterSettingDAO = require('./database/filter-setting-repo')
require('dotenv').config();

const kafkaHost = process.env.KAFKA_BROKER || 'localhost:9092';
const dbPath = './database/database.db'

const app = express();
const server = app.listen(3000, () => {
    console.log('WebSocket server listening on *:3000');
});
const io = socketIo(server);

DatabaseManager.runScript('./database/initDB.sql')
let filterRepo = new FilterSettingDAO(DatabaseManager)

const Consumer = kafka.Consumer;
const client = new kafka.KafkaClient({ kafkaHost: kafkaHost });
let consumer
let activeTopics = [];


async function getTopicsFromDatabase() {
    const enabledTopics = await filterRepo.getFilterSettings();
    return enabledTopics.filter(topic => topic.enabled).map(topic => {
        return {
            topic: topic.event
        }
    });
}

async function initializeConsumer() {
    activeTopics = await getTopicsFromDatabase();

    const options = { autoCommit: true, groupId: 'web-interface-group' };
    console.log(activeTopics)
    consumer = new Consumer(client, activeTopics, options);
}

initializeConsumer().then(() => {
    let unreadEventsBuffer = [];

    app.use(express.json());
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

    consumer.on('message', (message) => {
        io.emit('event', message.value);
        console.log(message.value);


        unreadEventsBuffer.push(message.value);
    });


    consumer.on('error', (error) => {
        console.error('Kafka consumer error:', error);
    });

    process.on('SIGINT', () => {
        console.log('Server shutting down');
        // Add any cleanup logic here
        process.exit();
    });


    app.post('/api/updateFilterSettings', async (req, res) => {
        const { event, enabled } = req.body;
        console.log("updated", event, enabled);

        try {
            await filterRepo.updateFilterSetting(event, enabled);
            activeTopics = await filterRepo.getFilterSettings();

            if (enabled) {
                consumer.addTopics([event], (addErr, added) => {
                    if (addErr) {
                        console.error('Error adding topic to Kafka Consumer:', addErr);
                        res.status(500).json({ success: false, error: 'Internal Server Error' });
                    } else {
                        console.log('Kafka Consumer topic added successfully');
                        res.status(200).json({ success: true });
                    }
                });
            } else {
                consumer.removeTopics([event], (removeErr, removed) => {
                    if (removeErr) {
                        console.error('Error removing topic from Kafka Consumer:', removeErr);
                        res.status(500).json({ success: false, error: 'Internal Server Error' });
                    } else {
                        console.log('Kafka Consumer topic removed successfully');
                        res.status(200).json({ success: true });
                    }
                });
            }
        } catch (error) {
            console.error('Error updating filter settings:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    });

    app.get('/api/getFilterSettings', async (req, res) => {
        try {
            const filterSettings = await filterRepo.getFilterSettings();

            const result = {};
            filterSettings.forEach(setting => {
                result[setting.event] = {
                    enabled: setting.enabled,
                };
            });

            res.status(200).json(result);
        } catch (error) {
            console.error('Error getting filter settings:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    });
})