// app.js
const socket = io();
const notificationContainer = document.getElementById('notification-container');
const temperatureValue1 = document.querySelector('#temperature-widget .widget-info .widget-value')
const temperatureValue2 = document.querySelector('#temperature-widget2 .widget-info .widget-value')
const humidityValue = document.querySelector('#humidity-widget .widget-info .widget-value')
console.log("app.js loaded")

// Maintain a mapping of topic checkboxes
const topicCheckboxes = {
    // temperature: document.getElementById('temperature-filter'),
    motion: document.getElementById('motion-filter'),
    door: document.getElementById('door-filter'),
    vibration: document.getElementById('vibration-filter'),
    sound: document.getElementById('sound-filter'),
};

socket.on('event', (eventJson) => {
    // Filter events based on selected topics
    let event = JSON.parse(eventJson);
    // console.log(topicCheckboxes)
    console.log(event)
    if (topicCheckboxes[event.sensorType] && topicCheckboxes[event.sensorType].checked) {
        displayEventNotification(event);
    }

    if (event.sensorType === 'temperature') {
        if (event.sensorId === 'Temp_001') temperatureValue1.innerHTML = `${Math.round(event.temperature)}°C`
        if (event.sensorId === 'Temp_002') temperatureValue2.innerHTML = `${Math.round(event.temperature)}°C`
    }

    if (event.sensorType === "humidity") {
        humidityValue.innerHTML = `${Math.round(event.humidity)}%`
    }
});

function displayEventNotification(event) {
    const notification = document.createElement('div');
    notification.classList.add('notification');

    const icon = document.createElement('img');
    icon.src = getIconPath(event.sensorType);

    const text = document.createElement('div');
    text.innerHTML = event.sensorDescription;

    const value = document.createElement('div');
    value.innerHTML = event.value;

    notification.appendChild(icon);
    notification.appendChild(text);
    notification.appendChild(value);

    console.log(notification)
    notificationContainer.insertBefore(notification, notificationContainer.firstChild);
}




function getIconPath(eventType) {
    switch (eventType) {
        case 'temperature':
            return './assets/temperature.png';
        case 'motion':
            return './assets/motion.png';
        case 'door':
            return './assets/door.png';
        case 'vibration':
            return './assets/vibration.png';
        case 'sound':
            return './assets/sound.png';
        case 'humidity':
            return './assets/humidity.png';
        default:
            return 'path/to/default-icon.png'; // Default icon for unknown types
    }
}