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

async function chiamataAPIbiciPropria(latitude, longitude) {
  try {
      const response = await fetch('/api/v1/biciPropria', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ position: { latitude, longitude } }),
      });
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error', error);
      throw error; 
  }
}

function fixMarkers(markers) {
    markers.forEach(marker => map.removeLayer(marker));

    markers.forEach(marker => {
        // Aggiorna la posizione del marker con le sue nuove coordinate
        marker.setLatLng(marker.getLatLng()).update();
    });
    // Aggiungi di nuovo tutti i marker alla mappa
    markers.forEach(marker => marker.addTo(map));
}

async function ricercaRastrelliereDispositivo() {
  showSpinner();
  const ul = document.getElementById('rastrelliere'); // Get the list where we will place our authors
  ul.textContent = '';
  let map;
  let markers = [];
  let selectedCoordinates = null;
  let first = true;
  map = L.map('mappaRastrelliera');
  let latitude;
  let longitude;
  

  try {
      const position = await requestLocation();
      
      //posizione reale
      //latitude = position.coords.latitude; 
      //longitude = position.coords.longitude;
      latitude = 46.069169527542655;
      longitude = 11.127596809959554;         

      document.getElementById('position').innerHTML = "Posizione dispositivo: [" + latitude + ", " + longitude + "]";

      // Crea una mappa centrata sulla posizione del dispositivo
      map.setView([latitude, longitude], 19);

      // Aggiungi il layer di OpenStreetMap alla mappa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
      }).addTo(map);

      // Aggiungi un marcatore rosso per la posizione del dispositivo
      L.marker([latitude, longitude], {icon: L.icon({iconUrl: 'res/icona-posizione.png'})}).addTo(map);

      // Chiamata API per ottenere le rastrelliere
      const data = await chiamataAPIbiciPropria(latitude, longitude);

      data.body.map(function(rastrelliera) {

          let btnRastrelliera = document.createElement('button');
          btnRastrelliera.style.display = 'block';
          btnRastrelliera.textContent = "Id: " + rastrelliera.id + " Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + rastrelliera.travelTime + " s";
          
          //seleziona una rastrelliera
          btnRastrelliera.onclick = async function() {
              markers.forEach(function(marker) {
                  map.removeLayer(marker);
              });
              let selectedMarker = L.marker([rastrelliera.latitude, rastrelliera.longitude], {icon: L.icon({iconUrl: 'res/icona-rastrelliera-selezionata.png'})});
              markers.push(selectedMarker);
              selectedMarker.addTo(map);
              selectedCoordinates = [rastrelliera.latitude, rastrelliera.longitude];
              if (first) {
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
      });
      
      // Aggiungi tutti i marker dalla lista alla mappa
      markers.forEach(function(marker) {
          marker.addTo(map);
      });


  } catch (error) {
      console.error('Errore durante la chiamata API:', error);
  } finally {
      hideSpinner();
  }
}


function creaLabelDestinazione() {
  // Creazione di un nuovo div per contenere il label e l'input
  const container = document.getElementById("labelDestinazione");

  const label = document.createElement('label');
  label.textContent = 'Inserisci la tua destinazione: ';

  const input = document.createElement('input');
  input.type = 'text';
  input.name = 'inputString';
  input.placeholder = 'La tua destinazione...';

  // Aggiunta del label e dell'input al div container
  container.appendChild(label);
  container.appendChild(input);
}

async function ricercaRastrelliereDestinazione(){
    let first1 = true;
    if(first1){
        first1=false;
        creaLabelDestinazione();
    }
  showSpinner();
  const ul = document.getElementById('rastrelliere'); // Get the list where we will place our authors
  ul.textContent = '';
  let map;
  let markers = [];
  let selectedCoordinates = null;
  let first = true;
  map = L.map('mappaRastrelliera');
  let latitude;
  let longitude;

  try {
      const position = await requestLocation();
      
      //posizione reale
      //latitude = position.coords.latitude; 
      //longitude = position.coords.longitude;
      latitude = 46.069194964432604;
      longitude = 11.121176732183985;         

      document.getElementById('position').innerHTML = "Posizione dispositivo: [" + latitude + ", " + longitude + "]";

      // Crea una mappa centrata sulla posizione del dispositivo
      map.setView([latitude, longitude], 19);

      // Aggiungi il layer di OpenStreetMap alla mappa
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 20,
      }).addTo(map);

      // Aggiungi un marcatore blu per la posizione del dispositivo
      L.marker([latitude, longitude], {icon: L.icon({iconUrl: 'res/icona-posizione.png'})}).addTo(map);

      // Chiamata API per ottenere le rastrelliere
      const data = await chiamataAPIbiciPropria(latitude, longitude);

      data.body.map(function(rastrelliera) {
          let btnRastrelliera = document.createElement('button');
          btnRastrelliera.style.display = 'block';
          btnRastrelliera.textContent = "Id: " + rastrelliera.id + " Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + rastrelliera.travelTime + " s";
          btnRastrelliera.onclick = async function() {
              markers.forEach(function(marker) {
                  map.removeLayer(marker);
              });
              let selectedMarker = L.marker([rastrelliera.latitude, rastrelliera.longitude], {icon: L.icon({iconUrl: 'res/icona-rastrelliera-selezionata.png'})});
              markers.push(selectedMarker);
              selectedMarker.addTo(map);
              selectedCoordinates = [rastrelliera.latitude, rastrelliera.longitude];
              if (first) {
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
      });

      // Aggiungi tutti i marker dalla lista alla mappa
      markers.forEach(function(marker) {
          marker.addTo(map);
      });

  } catch (error) {
      console.error('Errore durante la chiamata API:', error);
  } finally {
      hideSpinner();
  }

}