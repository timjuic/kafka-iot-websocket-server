// app.js
const socket = io();
const notificationContainer = document.getElementById('notification-container');
console.log("app.js loaded")

// Maintain a mapping of topic checkboxes
const topicCheckboxes = {
    temperature: document.getElementById('temperature-filter'),
    motion: document.getElementById('motion-filter'),
    door: document.getElementById('door-filter'),
    vibration: document.getElementById('vibration-filter'),
    sound: document.getElementById('vibration-filter'),
};

socket.on('event', (eventJson) => {
    // Filter events based on selected topics
    let event = JSON.parse(eventJson);
    // console.log(topicCheckboxes)
    console.log(event)
    if (topicCheckboxes[event.sensorType] && topicCheckboxes[event.sensorType].checked) {
        // console.log("displaying")
        displayEventNotification(event);
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
        default:
            return 'path/to/default-icon.png'; // Default icon for unknown types
    }
}