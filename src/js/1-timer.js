import flatpickr from 'flatpickr';
import iziToast from 'izitoast';

import 'izitoast/dist/css/iziToast.min.css';
import 'flatpickr/dist/flatpickr.min.css';

const button = document.querySelector('[data-start]');
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

function addLeadingZero(value) {
  return String(value).padStart(2, '0');
}

const display = {
  update({ days, hours, minutes, seconds }) {
    countdown.days.innerText = addLeadingZero(days);
    countdown.hours.innerText = addLeadingZero(hours);
    countdown.minutes.innerText = addLeadingZero(minutes);
    countdown.seconds.innerText = addLeadingZero(seconds);
  },
  setButtonEnabled(enabled) {
    button.disabled = !enabled;
  },
};

function render() {
  display.setButtonEnabled(!!userSelectedDate && !isTimerStarted());
  renderTime();
}

function renderTime() {
  display.update(getRemainDate());
}

function isFinished() {
  return userSelectedDate - Date.now() < 0;
}

function getRemainDate() {
  const now = Date.now();
  return convertMs((userSelectedDate || now) - now);
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
        userSelectedDate = null;
        return;
      }

      userSelectedDate = selectedMs;
      render();
    },
  });

  render();
  button.addEventListener('click', handleButton);
}

function handleButton() {
  if (isTimerStarted()) {
    return;
  }
  startTimer();
}

function startTimer() {
  intervalId = setInterval(() => {
    if (isFinished()) {
      return stopTimer();
    }
    render();
  }, 1000);
  display.setButtonEnabled(false);
}

function stopTimer() {
  clearInterval(intervalId);
  intervalId = null;
  userSelectedDate = null;
  render();
  toast('success', "Time's up!");
}

main();
