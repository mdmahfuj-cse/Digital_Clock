// DOM Elements
const timeDisplay = document.getElementById('timeDisplay');
const dateDisplay = document.getElementById('dateDisplay');
const formatToggle = document.getElementById('formatToggle');
const timezoneToggle = document.getElementById('timezoneToggle');
const snoozeBtn = document.getElementById('snoozeBtn');
const alarmForm = document.getElementById('alarmForm');
const alarmHour = document.getElementById('alarmHour');
const alarmMinute = document.getElementById('alarmMinute');
const alarmPeriod = document.getElementById('alarmPeriod');
const alarmLabel = document.getElementById('alarmLabel');
const alarmList = document.getElementById('alarmList');
const themeToggle = document.getElementById('themeToggle');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');
const alarmSound = document.getElementById('alarmSound');

// App State
let is24HourFormat = false;
let currentTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
let alarms = [];
let alarmCounter = 0;
let activeAlarm = null;
let isLightTheme = false;

// Initialize the app
function init() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    loadAlarmsFromStorage();
    renderAlarms();
    
    setupEventListeners();
    showNotification('Digital Clock initialized. Ready to set alarms!', 'success');
}

// Update date and time display
function updateDateTime() {
    const now = new Date();
    
    // Format time based on current settings
    let timeString;
    if (is24HourFormat) {
        timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            timeZone: currentTimezone 
        });
    } else {