// function textToSpeech(text) {
//     const speech = new SpeechSynthesisUtterance(text);
//     window.speechSynthesis.speak(speech);
//     speech.onend = () => {
//         listenForResponse();
//     };
// }

// function listenForResponse() {
//     const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
//     recognition.onstart = () => {
//         console.log('Voice recognition started. Try speaking into the microphone.');
//     };
//     recognition.onresult = (event) => {
//         const response = event.results[0][0].transcript;
//         console.log('You said: ' + response);
//         document.getElementById('response').innerHTML = `<p>You said: ${response}</p>`;
//         analyzeResponse(response);
//     };
//     recognition.start();
// }

// function analyzeResponse(response) {
//     axios.post('/analyze', { response: response })
//         .then((result) => {
//             const feedback = result.data.feedback;
//             document.getElementById('response').innerHTML += `<p>Feedback: ${feedback}</p>`;
//         })
//         .catch((error) => {
//             console.error('There was an error!', error);
//         });
// }

// window.onload = listenForResponse;


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/static/js/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
  