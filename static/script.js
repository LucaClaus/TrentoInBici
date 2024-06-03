//const { rawListeners } = require("../app/app");

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

async function chiamataAPISenzaBici(latitude, longitude) {
    try {
        const response = await fetch('/api/v1/senzaBici', {
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

async function stazioneBikeSharing(){
    const position = await requestLocation();
    chiamataAPISenzaBici(46.070979730902216, 11.121208984250735)
}

//pulsante rastrelliera vicino a me
async function posizioneDispositivo(){
    resetMappa();
    rimuoviElementiCreati();
    const position = await requestLocation();
      
    //posizione reale
    //latitude = position.coords.latitude; 
    //longitude = position.coords.longitude;
    latitude = 46.069169527542655;
    longitude = 11.127596809959554;

    if(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX){
      ricercaRastrelliere(latitude, longitude);
    }else{
      alert("La tua posizione è al di fuori dell'area consentita");
    }
}

//pulsante rastrelliera vicino alla mia destinazione
async function posizioneDestinazione() {
    resetMappa();
    rimuoviElementiCreati();

    const ul = document.getElementById('rastrelliere'); // Lista per visualizzare i dati delle rastrelliere
    ul.textContent = '';
    let selectedCoordinates = null;
    let first = true;

// Variabili per memorizzare le coordinate
let data;

creaLabelDestinazione();

map.on('click', async function (event) {

  resultElement.innerHTML='';
  resetMappa();
  // Ottieni le coordinate del click
  const coordinates = event.coordinate;
  const transformedCoordinates = ol.proj.toLonLat(coordinates);
  
  // Salva le coordinate in latitudine e longitudine
  latDest = transformedCoordinates[1];
  lonDest = transformedCoordinates[0];
  console.log('Click registered at:', coordinates, 'Lat/Lon:', latDest, lonDest);

  // Rimuovi i marker esistenti
  markerDest.getSource().clear();

  if(LAT_INF <= latDest && latDest < LAT_SUP && LON_SX <= lonDest && lonDest < LON_DX){
    const marker = new ol.Feature({
      geometry: new ol.geom.Point(coordinates)
  });

  // Aggiungi il nuovo marker al layer
  markerDest.getSource().addFeature(marker);

  pulsanteConfermaDestinazione();

  }else{
    resultElement.innerHTML='Posizione al di fuori dell\'area consentita'
    resultElement.style.color = 'red';
  }

  // Crea un nuovo marker alle coordinate cliccate
  
});
    // Impedisci lo scorrimento della mappa con la rotellina del mouse
    document.getElementById('mappaRastrelliera').addEventListener('wheel', function (event) {
        event.preventDefault();
    }, { passive: false });
};

//pulsante stazione bike sharing più vicina
async function posizioneDispositivo(){

    resetMappa();
    rimuoviElementiCreati();
      const position = await requestLocation();
        
      //posizione reale
      //latitude = position.coords.latitude; 
      //longitude = position.coords.longitude;
      latitude = 46.069169527542655;
      longitude = 11.127596809959554;
      if(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX){
        ricercaRastrelliere(latitude, longitude);
      }else{
        alert("La tua posizione è al di fuori dell'area consentita");
      }
}

//funzione che ricerca le rastrelliera con api e restituisce sulla mappa
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

const positionLabel= document.getElementById('position');
positionLabel.innerHTML = "Posizione: [" + latitude + ", " + longitude + "]";

const view = map.getView();
const newCenter = ol.proj.fromLonLat([longitude, latitude]);
view.setCenter(newCenter);
view.setZoom(15);

// Aggiunta dei controlli alla mappa
map.addControl(new ol.control.ScaleLine());
map.addControl(new ol.control.MousePosition());
//map.addControl(new ol.control.LayerSwitcher());

// Creazione del layer per i marker personalizzati


// Aggiunta del marker centrale
const centerFeature = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
});
markerLayer.getSource().addFeature(centerFeature);

// Chiamata all'API per ottenere i dati delle rastrelliere
const data = await chiamataAPIbiciPropria(latitude, longitude);

titoloRastrelliere = document.getElementById("titoloRastrelliere");
titoloRastrelliere.textContent="Rastrelliere più vicine";
titoloRastrelliere.classList.add('elemRes');




data.body.forEach(function(rastrelliera) {
    let btnRastrelliera = document.createElement('button');
    btnRastrelliera.classList.add('elemCreato');
    btnRastrelliera.style.display = 'block';
    btnRastrelliera.textContent = "Id: " + rastrelliera.id + " Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + rastrelliera.travelTime + " s";

    btnRastrelliera.onclick = function() {

        if(lonSelected!=null && latSelected!=null){
            let features = rastrellieraLayer.getSource().getFeatures();
            let existingFeature = features.find(feature => {
                let coordinates = feature.getGeometry().getCoordinates();
                let lonLat = ol.proj.toLonLat(coordinates);

                //fare approssimazione alle prime 7 cifre dopo il punto
                lonLat[0]=approx7cifre(lonLat[0]);
                lonLat[1]=approx7cifre(lonLat[1]);
                lonSelected=approx7cifre(lonSelected);
                latSelected=approx7cifre(latSelected);

                return lonLat[0] === lonSelected && lonLat[1] === latSelected;
            });

            if (existingFeature) {
                // Update the existing feature style
                existingFeature.setStyle(new ol.style.Style({
                    image: new ol.style.Icon({
                        src: 'res/icona-rastrelliera.png', 
                        anchor: [0.5, 1],
                        scale: 0.8
                    })
                }));
        }
    }

        lonSelected=rastrelliera.longitude;
        latSelected=rastrelliera.latitude;

        let features = rastrellieraLayer.getSource().getFeatures();

        let existingFeature = null;

        for (let i = 0; i < features.length; i++) {
            let feature = features[i];
            let coordinates = feature.getGeometry().getCoordinates();
            let lonLat = ol.proj.toLonLat(coordinates);

            //fare approssimazione alle prime 7 cifre dopo il punto
            lonLat[0]=approx7cifre(lonLat[0]);
            lonLat[1]=approx7cifre(lonLat[1]);
            lonSelected=approx7cifre(lonSelected);
            latSelected=approx7cifre(latSelected);

            if (lonLat[0] === lonSelected && lonLat[1] === latSelected) {
                existingFeature = feature; 
                break; 
            }
        }

        if(existingFeature){
            existingFeature.setStyle(new ol.style.Style({
                image: new ol.style.Icon({
                    src: 'res/icona-rastrelliera-selezionata.png', 
                    anchor: [0.5, 1],
                    scale: 0.8
                })
            }));
        }
  
            

        selectedCoordinates = [rastrelliera.latitude, rastrelliera.longitude];

        if (first) {
            let btnIniziaNavigazione = document.createElement('button');
            btnIniziaNavigazione.classList.add('elemCreato');
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

});

hideSpinner();


}