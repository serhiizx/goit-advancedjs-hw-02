import iziToast from "izitoast";
import "izitoast/dist/css/iziToast.min.css";

const form = document.querySelector('form')
const button = document.querySelector('button')

function createPromise(state, delay) {
  return new Promise((resolve, reject) => {
    if (state === 'rejected') {
      setTimeout(reject, delay)
    }

    if (state === 'fulfilled') {
      setTimeout(resolve, delay)
    }
  })
}

const notifier = {
  success: (message) => iziToast.success({ message }),
  error: (message = {}) => iziToast.error({ message }),
}

button.addEventListener('click', (event) => {
  event.preventDefault();

  const formData = new FormData(form)
  const data = normalizeData(Object.fromEntries(formData.entries()));
  const { state, delay } = data;

  createPromise(state, delay)
    .then(() => notifier.success(`✅ Fulfilled promise in ${delay}ms`))
    .catch(() => notifier.error(`❌ Rejected promise in ${delay}ms`))
})


function normalizeData(data) {
  return {
    ...data,
    delay: Number(data.delay),
  }
}