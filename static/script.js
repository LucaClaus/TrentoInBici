//const { rawListeners } = require("../app/app");

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

function pulsanteConfermaDestinazione(){
            const btnConfermaDestinazione = document.createElement('button');
            btnConfermaDestinazione.textContent = 'Conferma Destinazione';
            btnConfermaDestinazione.type = 'submit';
            btnConfermaDestinazione.onclick = function() {
              ricercaRastrelliere(latDest, lonDest);
            };

            const divInitNav = document.getElementById('btnConfermaDestinazione');
            divInitNav.innerHTML = ''; // Rimuovi qualsiasi contenuto precedente
            divInitNav.appendChild(btnConfermaDestinazione);

}

async function creaLabelDestinazione() {

  return new Promise((resolve, reject) => {

    const container = document.getElementById("labelDestinazione");

    // Pulizia del contenuto precedente del container
    container.innerHTML = '';

    const form = document.createElement('form');
    form.id = 'addressForm';

    const label = document.createElement('label');
    label.textContent = 'Inserisci la tua destinazione: ';

    const input = document.createElement('input');
    input.type = 'text';
    input.id = 'addressInput';
    input.name = 'inputString';
    input.placeholder = 'La tua destinazione...';

    const submit = document.createElement('button');
    submit.type = 'submit';
    submit.textContent = 'Invia';

    // Aggiunta del label, dell'input e del submit button al form
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(submit);

    // Aggiunta del form al div container
    container.appendChild(form);

    // Aggiungi l'event listener al form creato dinamicamente
    form.addEventListener('submit', function(event) {
      event.preventDefault();

      const address = document.getElementById('addressInput').value;
      const resultElement = document.getElementById('result');

      if (address) {
        // Utilizzare il servizio di geocodifica Nominatim di OpenStreetMap
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;

        fetch(url)
          .then(response => response.json())
          .then(data => {
            if (data.length > 0) {
              const place = data[0];
              resultElement.textContent = `Via trovata: ${place.display_name}`;
              resultElement.style.color = 'green';
              latDest = parseFloat(place.lat);
              lonDest = parseFloat(place.lon);
              markerDest.getSource().clear();
              const marker = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.fromLonLat([lonDest, latDest]))
              });
              
              const view = map.getView();
              const newCenter = ol.proj.fromLonLat([lonDest, latDest]);
              view.setCenter(newCenter);
              view.setZoom(15);

              markerDest.getSource().addFeature(marker);
              pulsanteConfermaDestinazione();
              //resolve({ latitude, longitude });
            } else {
              resultElement.textContent = 'Via non trovata. Verifica l\'indirizzo inserito.';
              resultElement.style.color = 'red';
              reject('Via non trovata');
            }
          })
          .catch(error => {
            console.error('Errore durante la richiesta:', error);
            resultElement.textContent = 'Errore durante la verifica della via. Riprova più tardi.';
            resultElement.style.color = 'red';
            reject(error);
          });
      } else {
        resultElement.textContent = 'Inserisci una via per favore.';
        resultElement.style.color = 'red';
        reject('Indirizzo non inserito');
      }
    });
  });
}

  async function posizioneDestinazione() {

    const ul = document.getElementById('rastrelliere'); // Lista per visualizzare i dati delle rastrelliere
    ul.textContent = '';
    let selectedCoordinates = null;
    let first = true;

// Variabili per memorizzare le coordinate
let data;

const rastrellieraLayer = new ol.layer.Vector({
  source: new ol.source.Vector()
});
map.addLayer(rastrellieraLayer);

map.on('click', async function (event) {
  // Ottieni le coordinate del click
  const coordinates = event.coordinate;
  const transformedCoordinates = ol.proj.toLonLat(coordinates);
  
  // Salva le coordinate in latitudine e longitudine
  latDest = transformedCoordinates[1];
  lonDest = transformedCoordinates[0];
  console.log('Click registered at:', coordinates, 'Lat/Lon:', latDest, lonDest);

  // Rimuovi i marker esistenti
  markerDest.getSource().clear();

  // Crea un nuovo marker alle coordinate cliccate
  const marker = new ol.Feature({
      geometry: new ol.geom.Point(coordinates)
  });

  // Aggiungi il nuovo marker al layer
  markerDest.getSource().addFeature(marker);

  pulsanteConfermaDestinazione();
});

creaLabelDestinazione();

    // Impedisci lo scorrimento della mappa con la rotellina del mouse
    document.getElementById('mappaRastrelliera').addEventListener('wheel', function (event) {
        event.preventDefault();
    }, { passive: false });
  };

  async function confermaDestinazione(latDest, lonDest){

  }

async function posizioneDispositivo(){
    const position = await requestLocation();
      
    //posizione reale
    //latitude = position.coords.latitude; 
    //longitude = position.coords.longitude;
    latitude = 46.069169527542655;
    longitude = 11.127596809959554;

    ricercaRastrelliere(latitude, longitude);

}

async function ricercaRastrelliere(lat, lon){
  showSpinner();
  // Inizializzazione delle variabili
const ul = document.getElementById('rastrelliere'); // Lista per visualizzare i dati delle rastrelliere
ul.textContent = '';
let selectedCoordinates = null;
let first = true;
let latitude = lat;
let longitude = lon;

document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
    event.preventDefault();
}, { passive: false });

document.getElementById('position').innerHTML = "Posizione dispositivo: [" + latitude + ", " + longitude + "]";

const view = map.getView();
const newCenter = ol.proj.fromLonLat([longitude, latitude]);
view.setCenter(newCenter);
view.setZoom(15);

// Aggiunta dei controlli alla mappa
map.addControl(new ol.control.ScaleLine());
map.addControl(new ol.control.MousePosition());
//map.addControl(new ol.control.LayerSwitcher());

// Creazione del layer per i marker personalizzati
const markerLayer = new ol.layer.Vector({
    source: new ol.source.Vector(),
    style: new ol.style.Style({
        image: new ol.style.Icon({
            src: 'res/icona-posizione.png',
            anchor: [0.5, 1],
            scale: 0.8
        })
    })
});
map.addLayer(markerLayer);

// Aggiunta del marker centrale
const centerFeature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
});
markerLayer.getSource().addFeature(centerFeature);

// Chiamata all'API per ottenere i dati delle rastrelliere
const data = await chiamataAPIbiciPropria(latitude, longitude);

// Creazione del layer per i marker delle rastrelliere
const rastrellieraLayer = new ol.layer.Vector({
    source: new ol.source.Vector()
});
map.addLayer(rastrellieraLayer);

data.body.forEach(function(rastrelliera) {
    let btnRastrelliera = document.createElement('button');
    btnRastrelliera.style.display = 'block';
    btnRastrelliera.textContent = "Id: " + rastrelliera.id + " Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + rastrelliera.travelTime + " s";

    btnRastrelliera.onclick = function() {
        rastrellieraLayer.getSource().clear();
        let selectedMarkerFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat([rastrelliera.longitude, rastrelliera.latitude])),
            description: "Selected Rastrelliera"
        });
        selectedMarkerFeature.setStyle(new ol.style.Style({
            image: new ol.style.Icon({
                src: 'res/icona-rastrelliera-selezionata.png',
                anchor: [0.5, 1],
                scale: 0.8
            })
        }));
        rastrellieraLayer.getSource().addFeature(selectedMarkerFeature);
        selectedCoordinates = [rastrelliera.latitude, rastrelliera.longitude];
        if (first) {
            let btnIniziaNavigazione = document.createElement('button');
            btnIniziaNavigazione.textContent = "Inizia navigazione";
            const divInitNav = document.getElementById('btnIniziaNavigazione');
            divInitNav.appendChild(btnIniziaNavigazione);
            first = false;
            btnIniziaNavigazione.onclick = function() {
                coordinatesGoogleMaps(selectedCoordinates[0], selectedCoordinates[1]);
            };
        }
    };

    ul.appendChild(btnRastrelliera);

    let markerFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([rastrelliera.longitude, rastrelliera.latitude])),
        description: "Rastrelliera"
    });
    markerFeature.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: 'res/icona-rastrelliera.png',
            anchor: [0.5, 1],
            scale: 0.8
        })
    }));
    rastrellieraLayer.getSource().addFeature(markerFeature);
});

hideSpinner();


}