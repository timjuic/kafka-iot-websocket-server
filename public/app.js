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
};

socket.on('event', (event) => {
    // Filter events based on selected topics
    console.log(event)
    console.log(topicCheckboxes)
    if (topicCheckboxes[event.type] && topicCheckboxes[event.type].checked) {
        console.log("displaying")
        displayEventNotification(event);
    }
});

function displayEventNotification(event) {
    const notification = document.createElement('div');
    notification.classList.add('notification');

    const icon = document.createElement('img');
    icon.src = getIconUrl(event.type);

    const text = document.createElement('div');
    text.textContent = event.description;

    const value = document.createElement('div');
    value.textContent = event.value;

    notification.appendChild(icon);
    notification.appendChild(text);
    notification.appendChild(value);

    notificationContainer.insertBefore(notification, notificationContainer.firstChild);
}

// Add filter management logic here
