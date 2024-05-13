const { rawListeners } = require("../app/app");

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
function showSpinner() {
  document.getElementById("spinner").style.display = "block";
}

// Nasconde la rotellina di attesa
function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
}

function coordinatesGoogleMaps(latitude, longitude){


  //console.log("destination googlemaps:", destination);
    fetch('/api/v1/googleMaps', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ destination: {latitude, longitude} })
    })
    .then(response => response.json())
    .then(data => {
        var directionsUrl= data.body;
        window.open(directionsUrl);
    })
    .catch(error => {
        console.error('Errore nella richiesta al backend:', error);
    });

}

function ricercaRastrelliereDispositivo() {
  showSpinner();
  const ul = document.getElementById('rastrelliere'); // Get the list where we will place our authors
  let markers = [];
  ul.textContent = '';
  let map 
  map = L.map('mappaRastrelliera')
  first = true
  let selectedCoordinates = null
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
          //let li = document.createElement('li'); 
          let btnRastrelliera = document.createElement('button');
          btnRastrelliera.style.display = 'block'; // Add this line
          btnRastrelliera.textContent = "Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + rastrelliera.travelTime + " s";
          btnRastrelliera.onclick=async function() {
            markers.forEach(function(marker) {
              map.removeLayer(marker);
              selectedCoordinates = [rastrelliera.latitude, rastrelliera.longitude];
            });
            marker = L.marker([rastrelliera.latitude, rastrelliera.longitude], {icon: L.icon({iconUrl: 'res/icona-rastrelliera-selezionata.png'})});
            markers.push(marker);
            marker.addTo(map);
            if(first){
              let btnIniziaNavigazione = document.createElement('button');
              btnIniziaNavigazione.textContent = "Inizia navigazione";
              const divInitNav = document.getElementById('btnIniziaNavigazione');
              divInitNav.appendChild(btnIniziaNavigazione);
              first = false;
            }
            btnIniziaNavigazione.onclick = function() {
              coordinatesGoogleMaps(selectedCoordinates[0], selectedCoordinates[1]);
            };
        };
          ul.appendChild(btnRastrelliera);
          let marker = L.marker([rastrelliera.latitude, rastrelliera.longitude], {icon: L.icon({iconUrl: 'res/icona-rastrelliera.png'})});
          markers.push(marker);
        })
      })
      .then(function() {
        // Aggiungi tutti i marker dalla lista alla mappa
        markers.forEach(function(marker) {
          marker.addTo(map);
          hideSpinner();
        });
      })
      .catch(error => {
          console.error('Error:', error);
      });
}