// app.js
const socket = io();
const notificationContainer = document.getElementById('notification-container');
const temperatureValue1 = document.querySelector('#temperature-widget .widget-info .widget-value')
const temperatureValue2 = document.querySelector('#temperature-widget2 .widget-info .widget-value')
const humidityValue = document.querySelector('#humidity-widget .widget-info .widget-value')
console.log("app.js loaded")

const topicCheckboxes = {
    motion: document.getElementById('motion-filter'),
    door: document.getElementById('door-filter'),
    vibration: document.getElementById('vibration-filter'),
    sound: document.getElementById('sound-filter'),
};


socket.on('event', (eventJson) => {
    // Filter events based on selected topics
    let event = JSON.parse(eventJson);
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
    notificationContainer.insertBefore(notification, notificationContainer.firstChild);
}


document.addEventListener('DOMContentLoaded', () => {
    Object.values(topicCheckboxes).forEach(checkbox => {
        checkbox.addEventListener('change', handleCheckboxChange);
    });
});

initializeCheckboxes();

async function initializeCheckboxes() {
     const response = await fetch('/api/getFilterSettings');
        if (response.ok) {
            const filterSettings = await response.json();
            console.log(filterSettings)

            Object.keys(topicCheckboxes).forEach(checkboxId => {
                console.log(checkboxId)
                const checkbox = topicCheckboxes[checkboxId];
                checkbox.checked = filterSettings[checkboxId].enabled;
            });
        } else {
            console.error('Failed to fetch filter settings:', response.statusText);
        }

}

async function handleCheckboxChange(event) {
    const checkboxId = event.target.id.split('-')[0];
    const isChecked = event.target.checked;
    console.log('change', checkboxId)

    try {
        const response = await fetch('/api/updateFilterSettings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: checkboxId,
                enabled: isChecked,
            }),
        });

        if (response.ok) {
            console.log(`Filter setting updated for ${checkboxId}`);
        } else {
            console.error('Failed to update filter setting:', response.statusText);
        }
    } catch (error) {
        console.error('Error updating filter setting:', error.message);
    }
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