// ========== Element Selectors ==========
const btn = document.querySelector('.talk');
const transcriptDisplay = document.getElementById('transcript');
const statusDisplay = document.getElementById('statusDisplay');
const waveform = document.getElementById('waveform');
const greetingText = document.getElementById('greetingText');
const userNameSpan = document.getElementById('userName');
const currentTime = document.getElementById('currentTime');
const currentDate = document.getElementById('currentDate');
const weatherInfo = document.getElementById('weatherInfo');
const typingAssistant = document.getElementById('typingAssistant');
const historyList = document.getElementById('historyList');
const notesList = document.getElementById('notesList');
const themeToggle = document.getElementById('themeToggle');

// Navigation Elements
const dashboardNav = document.getElementById('dashboardNav');
const appsNav = document.getElementById('appsNav');
const calendarNav = document.getElementById('calendarNav');
const settingsNav = document.getElementById('settingsNav');

// Page Elements
const dashboardPage = document.getElementById('dashboardPage');
const appsPage = document.getElementById('appsPage');
const calendarPage = document.getElementById('calendarPage');
const settingsPage = document.getElementById('settingsPage');

// Apps Page Elements
const appList = document.getElementById('appList');
const newAppNameInput = document.getElementById('newAppName');
const newAppUrlInput = document.getElementById('newAppUrl');
const addAppBtn = document.getElementById('addAppBtn');

// Calendar Page Elements
const currentCalendarDateSpan = document.getElementById('currentCalendarDate');
const eventsList = document.getElementById('eventsList');
const newEventTextInput = document.getElementById('newEventText');
const newEventDateInput = document.getElementById('newEventDate');
const addEventBtn = document.getElementById('addEventBtn');
const upcomingEventsList = document.getElementById('upcomingEventsList');

// Settings Page Elements
const inputUserName = document.getElementById('inputUserName');
const saveUserNameBtn = document.getElementById('saveUserName');
const resetMemoryBtn = document.getElementById('resetMemory');

// ========== Memory & State ==========
let userName = localStorage.getItem('jarvis_name') || 'User';
userNameSpan.textContent = userName;
let notes = JSON.parse(localStorage.getItem('jarvis_notes')) || [];
let rememberedCommands = JSON.parse(localStorage.getItem('jarvis_remembered_commands')) || {};
let userApps = JSON.parse(localStorage.getItem('jarvis_user_apps')) || [
    { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com' },
    { id: 'Google Search', name: 'Google Search', url: 'https://www.google.com/search?q=' }
];
let calendarEvents = JSON.parse(localStorage.getItem('jarvis_calendar_events')) || [];

// Set initial theme based on localStorage
const savedTheme = localStorage.getItem('jarvis_theme');
if (savedTheme === 'light') {
    document.body.classList.add('light');
    themeToggle.textContent = '🌞';
} else {
    document.body.classList.remove('light');
    themeToggle.textContent = '🌙';
}

// ========== Navigation Logic ==========
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');

    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('active');
    });
    document.getElementById(pageId.replace('Page', 'Nav')).classList.add('active');

    // Perform page-specific updates when shown
    if (pageId === 'appsPage') {
        displayApps();
    } else if (pageId === 'calendarPage') {
        displayEvents(new Date()); // Display today's events by default
        displayUpcomingEvents();
        newEventDateInput.valueAsDate = new Date(); // Set default date for new event
    } else if (pageId === 'settingsPage') {
        inputUserName.value = userName;
    }
}

dashboardNav.onclick = () => showPage('dashboardPage');
appsNav.onclick = () => showPage('appsPage');
calendarNav.onclick = () => showPage('calendarPage');
settingsNav.onclick = () => showPage('settingsPage');

// ========== Greeting ==========
function greetUser() {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';
    speak(`${greeting}, ${userName}. I am online and ready.`);
    greetingText.textContent = `${greeting}, ${userName}!`;
}

// ========== Time & Date ==========
function updateClock() {
    const now = new Date();
    currentTime.textContent = now.toLocaleTimeString();
    currentDate.textContent = now.toLocaleDateString();
}
setInterval(updateClock, 1000);
updateClock();

// ========== Theme Toggle ==========
themeToggle.onclick = () => {
    document.body.classList.toggle('light');
    const isLight = document.body.classList.contains('light');
    themeToggle.textContent = isLight ? '🌞' : '🌙';
    localStorage.setItem('jarvis_theme', isLight ? 'light' : 'dark');
};

// ========== Settings Page Logic ==========
saveUserNameBtn.onclick = () => {
    const newName = inputUserName.value.trim();
    if (newName) {
        userName = newName.charAt(0).toUpperCase() + newName.slice(1);
        localStorage.setItem('jarvis_name', userName);
        userNameSpan.textContent = userName;
        speak(`Name updated to ${userName}`);
        showPage('dashboardPage'); // Go back to dashboard after saving
    } else {
        speak("Please enter a valid name.");
    }
};

resetMemoryBtn.onclick = () => {
    if (confirm("Are you sure you want to clear all JARVIS data (name, notes, apps, calendar, remembered commands)?")) {
        localStorage.clear();
        userName = 'User';
        userNameSpan.textContent = userName;
        notes = [];
        rememberedCommands = {};
        userApps = [
            { id: 'youtube', name: 'YouTube', url: 'https://www.youtube.com' },
            { id: 'Google Search', name: 'Google Search', url: 'https://www.google.com/search?q=' }
        ];
        calendarEvents = [];
        displayNotes();
        historyList.innerHTML = '';
        displayApps(); // Refresh apps display
        displayEvents(new Date()); // Refresh calendar
        displayUpcomingEvents(); // Refresh upcoming events
        speak("All memory has been cleared.");
        // window.location.reload(); // Consider if a full reload is necessary or just re-initialization
        showPage('dashboardPage'); // Go back to dashboard
    }
};

// ========== Waveform Animation ==========
function toggleWaveform(active) {
    waveform.classList.toggle('active', active);
    statusDisplay.className = active ? 'status listening' : 'status';
}

// ========== Speech Synthesis ==========
function speak(text) {
    // Stop any ongoing speech before starting a new one
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1;
    utter.pitch = 1;
    utter.volume = 1;

    utter.onstart = () => {
        toggleWaveform(true);
        statusDisplay.textContent = 'Speaking...';
        statusDisplay.className = 'status talking';
        typingAssistant.value = text; // Display JARVIS's speech in the textarea
    };

    utter.onend = () => {
        toggleWaveform(false);
        statusDisplay.textContent = 'Idle';
        statusDisplay.className = 'status';
    };

    utter.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        statusDisplay.textContent = 'Speech Error';
        toggleWaveform(false);
    };

    window.speechSynthesis.speak(utter);
}

// ========== Speech Recognition ==========
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

// Check for SpeechRecognition API support
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    btn.addEventListener('click', () => {
        recognition.start();
    });

    recognition.onstart = () => {
        toggleWaveform(true);
        transcriptDisplay.textContent = 'Listening...';
        statusDisplay.textContent = 'Listening...';
    };

    recognition.onerror = e => {
        console.error('Speech recognition error:', e.error);
        speak("Sorry, I didn't catch that. Please try again.");
        statusDisplay.textContent = 'Error: ' + e.error;
        toggleWaveform(false); // Ensure waveform stops on error
    };

    recognition.onresult = event => {
        const msg = event.results[0][0].transcript.toLowerCase();
        transcriptDisplay.textContent = msg;
        statusDisplay.textContent = 'Processing...';
        historyList.innerHTML += `<div>🗣️ ${msg}</div>`; // Add to history
        historyList.scrollTop = historyList.scrollHeight; // Scroll to bottom
        takeCommand(msg);
    };

    recognition.onend = () => {
        toggleWaveform(false);
        statusDisplay.textContent = 'Idle';
    };
} else {
    // Fallback if SpeechRecognition is not supported
    btn.textContent = "Speech Not Supported";
    btn.disabled = true;
    statusDisplay.textContent = "Speech Recognition not supported in this browser.";
    speak("Your browser does not support speech recognition. Please use a modern browser like Chrome or Edge.");
}

// ========== Command Memory (Conceptual) ==========
function rememberCommand(command) {
    rememberedCommands[command] = (rememberedCommands[command] || 0) + 1;
    localStorage.setItem('jarvis_remembered_commands', JSON.stringify(rememberedCommands));
}

// ========== Notes Functionality ==========
function addNote(noteText) {
    const timestamp = new Date().toLocaleString();
    notes.push({ text: noteText, timestamp: timestamp });
    localStorage.setItem('jarvis_notes', JSON.stringify(notes));
    displayNotes();
    speak(`Note added: ${noteText}`);
}

function displayNotes() {
    notesList.innerHTML = '';
    if (notes.length === 0) {
        notesList.innerHTML = '<div>No notes yet. Try saying "add note buy milk".</div>';
        return;
    }
    notes.forEach((note, index) => {
        const noteDiv = document.createElement('div');
        noteDiv.innerHTML = `📝 ${note.text} <br><small>(${note.timestamp})</small>`;
        notesList.appendChild(noteDiv);
    });
    notesList.scrollTop = notesList.scrollHeight; // Scroll to bottom
}

// ========== App Management Functionality ==========
function displayApps() {
    appList.innerHTML = '';
    if (userApps.length === 0) {
        appList.innerHTML = '<p style="text-align: center;">No custom apps added yet.</p>';
    }

    userApps.forEach(app => {
        const appItem = document.createElement('div');
        appItem.classList.add('app-item');
        appItem.innerHTML = `
            <div>
                <h4>${app.name}</h4>
                <p>${app.url}</p>
            </div>
            <button class="app-launch-btn" data-app-url="${app.url}" data-app-id="${app.id}">Launch</button>
        `;
        // Add a "Remove" button for user-added apps, but not built-in ones
        if (!['youtube', 'Google Search'].includes(app.id)) {
             const removeBtn = document.createElement('button');
             removeBtn.textContent = 'Remove';
             removeBtn.classList.add('app-remove-btn');
             removeBtn.onclick = () => removeApp(app.id);
             appItem.appendChild(removeBtn);
        }

        appList.appendChild(appItem);
    });

    // Attach click listeners to all launch buttons after they are rendered
    document.querySelectorAll('.app-launch-btn').forEach(button => {
        button.onclick = (e) => launchApp(e.target.dataset.appUrl || e.target.dataset.appId);
    });
}

function addApp() {
    const name = newAppNameInput.value.trim();
    const url = newAppUrlInput.value.trim();

    if (name && url && (url.startsWith('http://') || url.startsWith('https://'))) {
        const newApp = {
            id: name.toLowerCase().replace(/\s/g, '_'), // Simple ID generation
            name: name,
            url: url
        };
        userApps.push(newApp);
        localStorage.setItem('jarvis_user_apps', JSON.stringify(userApps));
        displayApps();
        newAppNameInput.value = '';
        newAppUrlInput.value = '';
        speak(`${name} added to your apps.`);
    } else {
        speak("Please enter a valid app name and a valid URL starting with http or https.");
    }
}

function removeApp(appId) {
    if (['youtube', 'Google Search'].includes(appId)) {
        speak("You cannot remove built-in apps.");
        return;
    }
    userApps = userApps.filter(app => app.id !== appId);
    localStorage.setItem('jarvis_user_apps', JSON.stringify(userApps));
    displayApps();
    speak("App removed.");
}

function launchApp(appIdentifier) {
    let urlToOpen = '';
    if (appIdentifier.startsWith('http://') || appIdentifier.startsWith('https://')) {
        urlToOpen = appIdentifier; // Directly use URL if provided
    } else {
        // Find the app by ID
        const app = userApps.find(a => a.id === appIdentifier);
        if (app) {
            urlToOpen = app.url;
        }
    }

    if (urlToOpen) {
        window.open(urlToOpen, '_blank');
        speak(`Opening ${appIdentifier.replace(/_/g, ' ')}.`);
        showPage('dashboardPage'); // Go back to dashboard
    } else {
        speak(`Sorry, I couldn't find an app for ${appIdentifier}.`);
    }
}

addAppBtn.onclick = addApp;


// ========== Calendar Functionality ==========
function addCalendarEvent(eventText, eventDateStr) {
    const eventDate = new Date(eventDateStr);
    if (isNaN(eventDate)) {
        speak("That's not a valid date. Please try again.");
        return;
    }
    const timestamp = new Date().toLocaleString();
    calendarEvents.push({
        text: eventText,
        date: eventDate.toDateString(), // Store as readable date string
        timestampAdded: timestamp
    });
    // Sort events by date
    calendarEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    localStorage.setItem('jarvis_calendar_events', JSON.stringify(calendarEvents));
    displayEvents(eventDate);
    displayUpcomingEvents();
    speak(`Event "${eventText}" added for ${eventDate.toLocaleDateString()}.`);
}

function displayEvents(displayDate) {
    eventsList.innerHTML = '';
    const today = new Date();
    const isToday = displayDate.toDateString() === today.toDateString();

    currentCalendarDateSpan.textContent = displayDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (isToday) {
        currentCalendarDateSpan.textContent += ' (Today)';
    }

    const eventsForDisplay = calendarEvents.filter(event =>
        new Date(event.date).toDateString() === displayDate.toDateString()
    );

    if (eventsForDisplay.length === 0) {
        eventsList.innerHTML = '<div>No events for this day.</div>';
        return;
    }

    eventsForDisplay.forEach((event, index) => {
        const eventDiv = document.createElement('div');
        eventDiv.innerHTML = `📅 ${event.text}`;
        eventsList.appendChild(eventDiv);
    });
    eventsList.scrollTop = eventsList.scrollHeight;
}

function displayUpcomingEvents() {
    upcomingEventsList.innerHTML = '';
    const now = new Date();
    const futureEvents = calendarEvents.filter(event =>
        new Date(event.date) >= now
    ).slice(0, 5); // Show next 5 upcoming events

    if (futureEvents.length === 0) {
        upcomingEventsList.innerHTML = '<div>No upcoming events.</div>';
        return;
    }

    futureEvents.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.innerHTML = `📅 ${event.text} on ${new Date(event.date).toLocaleDateString()}`;
        upcomingEventsList.appendChild(eventDiv);
    });
}

addEventBtn.onclick = () => {
    const text = newEventTextInput.value.trim();
    const date = newEventDateInput.value; // YYYY-MM-DD format
    if (text && date) {
        addCalendarEvent(text, date);
        newEventTextInput.value = '';
        newEventDateInput.valueAsDate = new Date(); // Reset date to today
    } else {
        speak("Please enter both an event description and a date.");
    }
};


// ========== Commands ==========
async function takeCommand(msg) {
    typingAssistant.value = `Processing: "${msg}"...`;
    rememberCommand(msg);

    // Prioritize internal/frontend commands
    if (msg.includes("my name is")) {
        const newName = msg.split("my name is")[1].trim();
        if (newName) {
            userName = newName.charAt(0).toUpperCase() + newName.slice(1);
            localStorage.setItem('jarvis_name', userName);
            userNameSpan.textContent = userName;
            speak(`Nice to meet you, ${userName}`);
        } else {
            speak("Please tell me your name after 'my name is'.");
        }
    } else if (msg.includes("what's your name") || msg.includes("who are you")) {
        speak("I am JARVIS, your personal AI assistant. I am currently running version 4.0.");
    } else if (msg.includes("time")) {
        const now = new Date().toLocaleTimeString();
        speak(`The time is ${now}`);
    } else if (msg.includes("date")) {
        const today = new Date().toLocaleDateString();
        speak(`Today's date is ${today}`);
    } else if (msg.includes("clear history")) {
        historyList.innerHTML = '';
        speak("Command history cleared.");
    } else if (msg.includes("clear notes")) {
        notes = [];
        localStorage.removeItem('jarvis_notes');
        displayNotes();
        speak("All notes cleared.");
    } else if (msg.includes("show my notes")) {
        if (notes.length > 0) {
            let notesText = "Your notes are: ";
            notes.forEach((note, index) => {
                notesText += `Note ${index + 1}: ${note.text}. Added on ${note.timestamp}. `;
            });
            speak(notesText);
        } else {
            speak("You don't have any notes yet.");
        }
    } else if (msg.includes("add note")) {
        const noteContent = msg.split("add note")[1].trim();
        if (noteContent) {
            addNote(noteContent);
        } else {
            speak("What would you like to add to your notes?");
        }
    } else if (msg.includes("weather")) {
        fetchWeather();
    } else if (msg.includes("stop listening") || msg.includes("stop")) {
        if (recognition && recognition.listening) {
            recognition.stop();
            speak("Listening stopped.");
        } else {
            speak("I'm not currently listening.");
        }
    }
    // New Commands: Navigation
    else if (msg.includes("go to apps") || msg.includes("open apps")) {
        speak("Opening apps page.");
        showPage('appsPage');
    } else if (msg.includes("go to calendar") || msg.includes("open calendar")) {
        speak("Opening calendar page.");
        showPage('calendarPage');
    } else if (msg.includes("go to settings") || msg.includes("open settings")) {
        speak("Opening settings page.");
        showPage('settingsPage');
    } else if (msg.includes("go to dashboard") || msg.includes("go home")) {
        speak("Returning to dashboard.");
        showPage('dashboardPage');
    }
    // New Commands: Apps
    else if (msg.includes("launch")) {
        const appName = msg.split("launch")[1].trim();
        const app = userApps.find(a => msg.includes(a.name.toLowerCase()));
        if (app) {
            launchApp(app.url);
        } else {
            speak(`Sorry, I couldn't find an app named ${appName}. You can add it in the Apps section.`);
        }
    }
    // New Commands: Calendar
    else if (msg.includes("add event")) {
        // Basic parsing for "add event [text] on [date]"
        const parts = msg.split("add event")[1].trim().split("on");
        if (parts.length === 2) {
            const eventText = parts[0].trim();
            const eventDateStr = parts[1].trim();
            // Attempt to parse date string for speech recognition.
            // For robust date parsing, you might need a library or more complex logic.
            let date = new Date(eventDateStr);
            if (isNaN(date)) {
                speak("I couldn't understand the date. Please try saying 'add event meeting on January 1st'.");
            } else {
                 // Format date to YYYY-MM-DD for addCalendarEvent
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
                const day = String(date.getDate()).padStart(2, '0');
                addCalendarEvent(eventText, `${year}-${month}-${day}`);
            }
        } else {
            speak("Please tell me what event to add and when, like 'add event meeting on tomorrow'.");
        }
    } else if (msg.includes("show my events") || msg.includes("what are my events")) {
        speak("Opening calendar to show your events.");
        showPage('calendarPage');
    } else if (msg.includes("search youtube for") || msg.includes("play song") || msg.includes("play video")) {
        let query = '';
        if (msg.includes("search youtube for")) {
            query = msg.split("search youtube for")[1].trim();
        } else if (msg.includes("play song")) {
            query = msg.split("play song")[1].trim();
        } else if (msg.includes("play video")) {
            query = msg.split("play video")[1].trim();
        }

        if (query) {
            window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`, "_blank");
            speak(`Searching YouTube for ${query}.`);
            showPage('dashboardPage'); // Go back to dashboard
        } else {
            speak("What would you like to search for on YouTube?");
        }
    }
    // Backend commands / AI fallback
    else {
        try {
            const response = await fetch('http://127.0.0.1:5000/command', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: msg }),
            });
            const data = await response.json();
            speak(data.response);

            // If the backend suggests a web search, open Google
            if (data.action === 'web_search' && data.query) {
                 window.open(`https://www.google.com/search?q=${encodeURIComponent(data.query)}`, "_blank");
                 speak(`Searching Google for ${data.query}.`);
            }

        } catch (error) {
            console.error('Error sending command to backend:', error);
            speak("I'm sorry, I couldn't reach my server. Please ensure the backend is running. I can try to search for that online if you'd like.");
            // If backend is down, *only* suggest web search if explicitly asked or for very general queries
            if (msg.includes("search for") || msg.includes("find information about")) {
                const query = msg.replace(/search for|find information about/g, '').trim();
                if (query) {
                    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank");
                }
            }
        }
    }
}

// ========== Weather API (Open-Meteo) ==========
function fetchWeather() {
    weatherInfo.textContent = 'Fetching weather...';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok.');
                    return res.json();
                })
                .then(data => {
                    const temp = data.current_weather.temperature;
                    const weatherCode = data.current_weather.weathercode;
                    let weatherDescription = "unknown conditions";
                    if (weatherCode === 0) weatherDescription = "clear sky";
                    else if (weatherCode >= 1 && weatherCode <= 3) weatherDescription = "partly cloudy";
                    else if (weatherCode >= 45 && weatherCode <= 48) weatherDescription = "foggy";
                    else if (weatherCode >= 51 && weatherCode <= 67) weatherDescription = "raining";
                    else if (weatherCode >= 80 && weatherCode <= 82) weatherDescription = "rain showers";
                    else if (weatherCode >= 95 && weatherCode <= 99) weatherDescription = "thunderstorms";

                    const info = `It's ${temp}°C and ${weatherDescription} at your location.`;
                    weatherInfo.textContent = info;
                    speak(info);
                }).catch(error => {
                    console.error('Weather fetch error:', error);
                    weatherInfo.textContent = 'Unable to fetch weather.';
                    speak("I couldn't get the weather information.");
                });
        }, (error) => {
            console.error('Geolocation error:', error);
            if (error.code === error.PERMISSION_DENIED) {
                speak("Location access is denied. Please enable location services for weather updates.");
                weatherInfo.textContent = "Location access denied.";
            } else {
                speak("I couldn't get your location for weather updates.");
                weatherInfo.textContent = "Location error.";
            }
        });
    } else {
        speak("Geolocation is not supported by your browser for weather updates.");
        weatherInfo.textContent = "Geolocation not supported.";
    }
}

// ========== Init ==========
window.onload = () => {
    greetUser();
    fetchWeather();
    displayNotes(); // Display notes on load
    displayApps(); // Display apps on load
    displayEvents(new Date()); // Display today's events on load
    displayUpcomingEvents(); // Display upcoming events on load
    showPage('dashboardPage'); // Ensure dashboard is shown initially
};