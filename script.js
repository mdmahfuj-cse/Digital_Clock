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
                timeString = now.toLocaleTimeString('en-US', { 
            hour12: true, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            timeZone: currentTimezone 
        });
    }
    
    // Format date
    const dateString = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: currentTimezone 
    });
    
    timeDisplay.textContent = timeString;
    dateDisplay.textContent = dateString;
    
    // Check for active alarms
    checkAlarms(now);
}

// Load alarms from localStorage
function loadAlarmsFromStorage() {
    const savedAlarms = localStorage.getItem('digitalClockAlarms');
    if (savedAlarms) {
        alarms = JSON.parse(savedAlarms);
        alarmCounter = alarms.length > 0 ? Math.max(...alarms.map(a => a.id)) + 1 : 0;
    }
}

// Save alarms to localStorage
function saveAlarmsToStorage() {
    localStorage.setItem('digitalClockAlarms', JSON.stringify(alarms));
}

// Render alarms to the UI
function renderAlarms() {
    alarmList.innerHTML = '';
    
    if (alarms.length === 0) {
        alarmList.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">No alarms set. Add one above!</p>';
        return;
    }
       alarms.forEach(alarm => {
        const alarmItem = document.createElement('div');
        alarmItem.className = `alarm-item ${alarm.active ? 'active' : ''} ${alarm.triggered ? 'triggered' : ''}`;
        alarmItem.dataset.id = alarm.id;
        
        // Format alarm time for display
        let displayTime = formatAlarmTimeForDisplay(alarm.hour, alarm.minute, alarm.period);
        
        alarmItem.innerHTML = `
            <div class="alarm-info">
                <div class="alarm-time">${displayTime}</div>
                <div class="alarm-label">${alarm.label || 'Alarm'}</div>
            </div>
            <div class="alarm-actions">
                <button class="icon-btn toggle-btn" title="${alarm.active ? 'Disable Alarm' : 'Enable Alarm'}">
                    <i class="fas ${alarm.active ? 'fa-bell' : 'fa-bell-slash'}"></i>
                </button>
                <button class="icon-btn delete-btn" title="Delete Alarm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        alarmList.appendChild(alarmItem);
        
        // Add event listeners to the buttons
        const toggleBtn = alarmItem.querySelector('.toggle-btn');
        const deleteBtn = alarmItem.querySelector('.delete-btn');
        
        toggleBtn.addEventListener('click', () => toggleAlarm(alarm.id));
        deleteBtn.addEventListener('click', () => deleteAlarm(alarm.id));
    });
    }

// Format alarm time for display
function formatAlarmTimeForDisplay(hour, minute, period) {
    let displayHour = hour;
    
    if (!is24HourFormat && period) {
        // Convert to 12-hour format for display
        if (period === 'PM' && hour < 12) displayHour = hour + 12;
        if (period === 'AM' && hour === 12) displayHour = 0;
    }
    
    const formattedHour = displayHour.toString().padStart(2, '0');
    const formattedMinute = minute.toString().padStart(2, '0');
    
    if (is24HourFormat) {
        return `${formattedHour}:${formattedMinute}`;
    } else {
        return `${formattedHour}:${formattedMinute} ${period}`;
    }
}

// Add a new alarm
function addAlarm(hour, minute, period, label) {
    // Validate input
    if (hour < 0 || hour > 23) {
        showNotification('Hour must be between 0 and 23', 'danger');
        return;
    }
    
    if (minute < 0 || minute > 59) {
        showNotification('Minute must be between 0 and 59', 'danger');
        return;
    }
    
    const newAlarm = {
        id: alarmCounter++,
        hour: parseInt(hour),
        minute: parseInt(minute),
        period: period || 'AM',
        label: label || 'Alarm',
        active: true,
        triggered: false,
        snoozed: false
    };
        
    alarms.push(newAlarm);
    saveAlarmsToStorage();
    renderAlarms();
    
    showNotification(`Alarm set for ${formatAlarmTimeForDisplay(hour, minute, period)}`, 'success');
    
    // Reset form
    alarmHour.value = '07';
    alarmMinute.value = '30';
    alarmPeriod.value = 'AM';
    alarmLabel.value = '';
}

// Toggle alarm active state
function toggleAlarm(id) {
    const alarmIndex = alarms.findIndex(alarm => alarm.id === id);
    if (alarmIndex !== -1) {
        alarms[alarmIndex].active = !alarms[alarmIndex].active;
        alarms[alarmIndex].triggered = false;
        saveAlarmsToStorage();
        renderAlarms();
        
        const alarm = alarms[alarmIndex];
        const status = alarm.active ? 'enabled' : 'disabled';
        showNotification(`Alarm ${status} for ${formatAlarmTimeForDisplay(alarm.hour, alarm.minute, alarm.period)}`, 'warning');
        
        // Stop alarm sound if it was triggered
        if (!alarm.active && activeAlarm && activeAlarm.id === id) {
            stopAlarmSound();
        }
    }
}
