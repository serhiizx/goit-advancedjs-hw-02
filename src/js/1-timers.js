import flatpickr from 'flatpickr';
import iziToast from 'izitoast';

import 'izitoast/dist/css/iziToast.min.css';
import 'flatpickr/dist/flatpickr.min.css';

const button = document.querySelector('#button-start');
const countdown = {
  days: document.querySelector('.timer [data-days]'),
  hours: document.querySelector('.timer [data-hours]'),
  minutes: document.querySelector('.timer [data-minutes]'),
  seconds: document.querySelector('.timer [data-seconds]'),
};

let intervalId = null;
let userSelectedDate = null;

function initDatepicker(options) {
  flatpickr('#datetime-picker', {
    enableTime: true,
    time_24hr: true,
    defaultDate: new Date(),
    minuteIncrement: 1,
    locale: {
      firstDayOfWeek: 1, // start week on Monday
    },
    ...options,
  });
}

function toast(type, message) {
  iziToast[type]?.({ message });
}

function convertMs(ms) {
  // Number of milliseconds per unit of time
  const second = 1000;
  const minute = second * 60;
  const hour = minute * 60;
  const day = hour * 24;

  // Remaining days
  const days = Math.floor(ms / day);
  // Remaining hours
  const hours = Math.floor((ms % day) / hour);
  // Remaining minutes
  const minutes = Math.floor(((ms % day) % hour) / minute);
  // Remaining seconds
  const seconds = Math.floor((((ms % day) % hour) % minute) / second);

  return { days, hours, minutes, seconds };
}

const display = {
  update({ days, hours, minutes, seconds }) {
    countdown.days.innerText = String(days).padStart(2, '0');
    countdown.hours.innerText = String(hours).padStart(2, '0');
    countdown.minutes.innerText = String(minutes).padStart(2, '0');
    countdown.seconds.innerText = String(seconds).padStart(2, '0');
  },
  setButtonLabel(running) {
    button.textContent = running ? 'Stop' : 'Start';
  },
  setButtonEnabled(enabled) {
    button.disabled = !enabled;
  },
};


function render() {
  display.setButtonEnabled(!!userSelectedDate)
  renderTime();
}

function renderTime() {
  display.update(getRemainDate())
}

function isFinished() {
  console.log('isFinished', userSelectedDate, Date.now(), userSelectedDate - Date.now(), userSelectedDate - Date.now() < 0)
  return userSelectedDate - Date.now() < 0;
}

function getRemainDate() {
  return convertMs(userSelectedDate - Date.now());
}

function isTimerStarted() {
  return !!intervalId;
}

function main() {
  initDatepicker({
    onClose(selectedDates) {
      const now = Date.now();
      const selectedMs =
        selectedDates[0]?.toTemporalInstant().epochMilliseconds;

      if (!selectedMs) {
        return;
      }

      if (selectedMs < now) {
        toast('warning', 'Please choose a date in the future');
        userSelectedDate = null
        return;
      }

      userSelectedDate = selectedMs;
      render();
    },
  });

  button.addEventListener('click', handleButton);
}

function handleButton() {
  if (isTimerStarted()) {
    stopTimer();

  } else {
    startTimer();
  }
}

function startTimer() {
  display.setButtonLabel(true)
  intervalId = setInterval(() => {
    if (isFinished()) {
      return stopTimer();
    }
    render();
  }, 1000);
}

function stopTimer() {
  if (intervalId) {
    clearInterval(intervalId);
  }
  display.setButtonLabel(false)
  display.setButtonEnabled(false)
}

main();
