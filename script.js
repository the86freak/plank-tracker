document.addEventListener("DOMContentLoaded", () => {
    initialize();
    document.getElementById("startPlank").addEventListener("click", startPlankTimer);
});

function initialize() {
    const startDate = new Date("2024-06-01");
    const calendar = document.getElementById("calendar");
    const completedDaysElement = document.getElementById("completedDays");
    const streakElement = document.getElementById("streak");
    const startPlankButton = document.getElementById("startPlank");
    const timerElement = document.getElementById("timer");

    const data = getPlankData();  // Load data from local storage

    function updateCalendar() {
        const today = new Date();
        const dayDiff = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

        calendar.innerHTML = '';

        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).getDay();

        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement("div");
            emptyDay.classList.add('day');
            emptyDay.style.visibility = 'hidden';
            calendar.appendChild(emptyDay);
        }

        let completedDays = 0;
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;

        for (let i = 0; i < daysInMonth; i++) {
            const date = new Date(today.getFullYear(), today.getMonth(), i + 1);
            const dayElement = document.createElement("div");
            dayElement.textContent = date.getDate();
            dayElement.classList.add('day');
            dayElement.dataset.date = date.toISOString().split('T')[0];
            const isCompleted = data[dayElement.dataset.date];

            if (isCompleted) {
                dayElement.classList.add('completed');
                completedDays++;
                tempStreak++;
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
            } else {
                tempStreak = 0;
            }

            dayElement.classList.toggle('today', date.toDateString() === today.toDateString());
            dayElement.addEventListener("click", () => {
                toggleComplete(dayElement);
                updateCalendar();
            });

            calendar.appendChild(dayElement);
        }

        completedDaysElement.textContent = `Abgeschlossene Tage: ${completedDays}`;
        streakElement.textContent = `Längste Serie: ${longestStreak} Tage`;

        updatePlankTimer(dayDiff);
    }

    function updatePlankTimer(dayDiff) {
        const plankTime = 10 + dayDiff;
        startPlankButton.textContent = `Start Plank für Tag ${dayDiff + 1}`;
        startPlankButton.dataset.time = plankTime;
        timerElement.textContent = `00:${plankTime < 10 ? '0' : ''}${plankTime}`;
    }

    updateCalendar();
}

function getPlankData() {
    return JSON.parse(localStorage.getItem('plankData') || '{}');
}

function savePlankData(data) {
    localStorage.setItem('plankData', JSON.stringify(data));
}

function toggleComplete(dayElement) {
    const data = getPlankData();
    const date = dayElement.dataset.date;
    if (data[date]) {
        delete data[date];
        dayElement.classList.remove('completed');
    } else {
        data[date] = true;
        dayElement.classList.add('completed');
    }
    savePlankData(data);
}

function startPlankTimer() {
    const plankTime = parseInt(document.getElementById("startPlank").dataset.time);
    const timerElement = document.getElementById("timer");
    const startTime = Date.now();

    function updateTimer() {
        const now = Date.now();
        const timeElapsed = Math.floor((now - startTime) / 1000);
        const timeLeft = plankTime - timeElapsed;

        if (timeLeft <= 0) {
            timerElement.textContent = "Fertig!";
            markTodayAsCompleted();
            return;
        }

        timerElement.textContent = `00:${timeLeft < 10 ? '0' : ''}${timeLeft}`;
        requestAnimationFrame(updateTimer);
    }

    updateTimer();
}

function markTodayAsCompleted() {
    const today = new Date().toISOString().split('T')[0];
    const dayElement = document.querySelector(`[data-date="${today}"]`);
    if (dayElement) {
        const data = getPlankData();
        data[today] = true;
        savePlankData(data);
        dayElement.classList.add('completed');
    }
}
