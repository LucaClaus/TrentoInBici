const { rawListeners } = require("../app/app");

function prova(){
  //get the form object
  var email = "prova"
  // console.log(email);

  fetch('../api/v1/prova', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( { email: email } ),
  })
  .then((resp) => resp.json()) // Transform the data into json
  .then(function(data) { // Here you get the data to modify as you please
    document.getElementById("prova").innerHTML = data.message;
    return;
})
  .catch( error => console.error(error) ); // If there is any error you will catch them here

}

//funzione per richiesta della geolocalizzazione
function requestLocation() {
  return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(resolve, reject);
      } else {
          reject(new Error("Geolocation is not supported by this browser."));
      }
  });
}

function ricercaRastrelliereDispositivo() {
  const ul = document.getElementById('rastrelliere'); // Get the list where we will place our authors
  let markers = [];
  ul.textContent = '';
  let map 
  map = L.map('mappaRastrelliera')
  requestLocation()
      .then(position => {
          //posizione reale
          //var latitude = position.coords.latitude; 
          //var longitude = position.coords.longitude;
          //posizione di prova
          var latitude = 46.06963486035415; 
          var longitude = 11.120475178226306;


          document.getElementById('position').innerHTML="Posizione dispositivo: [" + latitude + ", " + longitude + "]";
          // Crea una mappa centrata sulla posizione del dispositivo
          map.setView([latitude, longitude], 15);
          // Aggiungi il layer di OpenStreetMap alla mappa
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              maxZoom: 19,
          }).addTo(map);

          // Aggiungi un marcatore blu per la posizione del dispositivo
          L.marker([latitude, longitude], {icon: L.icon({iconUrl: 'res/icona-posizione.png'})}).addTo(map);

          return fetch('/api/v1/biciPropria', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ position: { latitude, longitude } }),
          });
      })
      .then(response => response.json())
      .then(function(data){
        
        return data.body.map(function(rastrelliera) {
          let li = document.createElement('li'); 
          let btn = document.createElement('button');
          btn.style.display = 'block'; // Add this line
          btn.textContent = "Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + rastrelliera.travelTime + " s";
          ul.appendChild(btn);
          let marker = L.marker([rastrelliera.latitude, rastrelliera.longitude], {icon: L.icon({iconUrl: 'res/icona-rastrelliere.png'})});
          markers.push(marker);
        })
      })
      .then(function() {
        // Aggiungi tutti i marker dalla lista alla mappa
        markers.forEach(function(marker) {
          marker.addTo(map);
        });
      })
      .catch(error => {
          console.error('Error:', error);
      });

  
}