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

async function chiamataAPIbiciPropriaAll(){
    try {
        const response = await fetch('/api/v1/biciPropria/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
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

 async function chiamataAPISenzaBiciAll(){
    try {
        const response = await fetch('/api/v1/senzaBici/all', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error', error);
        throw error; 
    }
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
  
  let lonSelected;
  let latSelected;
  
  
  data.body.forEach(function(rastrelliera) {
      let btnRastrelliera = document.createElement('button');
      btnRastrelliera.classList.add('elemCreato', 'btn', 'btn-primary', 'mb-2');
      btnRastrelliera.style.display = 'block';
      btnRastrelliera.textContent = " Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + rastrelliera.travelTime + " s";
  
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
              btnIniziaNavigazione.classList.add('elemCreato','btn', 'btn-primary', 'mr-2');
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

async function ricercaStralli(lat, lon){
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
  
  const positionLabel = document.getElementById('position');
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
    const data = await chiamataAPISenzaBici(latitude, longitude);

    titoloStralli = document.getElementById("titoloRastrelliere");
    titoloStralli.textContent="Stralli più vicini";
    titoloStralli.classList.add('elemRes');

    let lonSelected;
    let latSelected;
  
    data.body.forEach(function(rastrelliera) {
      let btnRastrelliera = document.createElement('button');
      btnRastrelliera.classList.add('elemCreato', 'btn', 'btn-primary', 'mb-2');
      btnRastrelliera.style.display = 'block';
      btnRastrelliera.textContent = "Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + rastrelliera.travelTime + " s" + 
                                    ", Posti liberi: " + rastrelliera.numPostiLiberi + 
                                    ", Bici disponibili: " + rastrelliera.numBiciDisponibili;
  
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
              btnIniziaNavigazione.classList.add('elemCreato','btn', 'btn-primary', 'mr-2');
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

async function ricercaStrallo(latS, lonS, latD, lonD){
    showSpinner();
    const ul = document.getElementById('rastrelliere'); // Lista per visualizzare i dati delle rastrelliere
    ul.textContent = '';
    let latitudeStart = latS;
    let longitudeStart = lonS;
    let latitudeDestiantion = latD;
    let longitudeDestiantion= lonD;
    let first = true;

    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    const positionLabelStart = document.getElementById('position');
    positionLabelStart.innerHTML = "Posizione di partenza: [" + latitudeStart + ", " + longitudeStart + "] " + 
                                    "Posizione di arrivo: [" + latitudeDestiantion + ", " + longitudeDestiantion + "]";

    const view = map.getView();
    const newCenter = ol.proj.fromLonLat([longitudeStart, latitudeStart]);
    view.setCenter(newCenter);
    view.setZoom(15);

    // Aggiunta dei controlli alla mappa
    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());
    
    // Aggiunta del marker centrale
    const centerFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitudeStart, latitudeStart]))
    });
    markerLayer.getSource().addFeature(centerFeature);

    // Chiamata all'API per ottenere i dati degli stralli
    const dataStage1 = await chiamataAPISenzaBici(latitudeStart, longitudeStart);
    const dataStage2 = await chiamataAPISenzaBici(latitudeDestiantion, longitudeDestiantion);

    let minDistanceElement1 = dataStage1.body.reduce((prev, curr) => {
        return (prev.distanza < curr.distanza) ? prev : curr;
    });

    let minDistanceElement2 = dataStage2.body.reduce((prev, curr) => {
        return (prev.distanza < curr.distanza) ? prev : curr;
    });

    if(minDistanceElement1.id == minDistanceElement2.id){
        alert("Data la tua posizione di partenza e arrivo non ci sono due stralli che possono esserti utili");
    }

    let selectedMarkerFeature1 = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([minDistanceElement1.longitude, minDistanceElement1.latitude])),
        description: "Selected Rastrelliera"
    });
    selectedMarkerFeature1.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: 'res/icona-rastrelliera-selezionata.png',
            anchor: [0.5, 1],
            scale: 0.8
        })
    }));
    rastrellieraLayer.getSource().addFeature(selectedMarkerFeature1);

    let selectedMarkerFeature2 = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([minDistanceElement2.longitude, minDistanceElement2.latitude])),
        description: "Selected Rastrelliera"
    });
    selectedMarkerFeature2.setStyle(new ol.style.Style({
        image: new ol.style.Icon({
            src: 'res/icona-rastrelliera-selezionata.png',
            anchor: [0.5, 1],
            scale: 0.8
        })
    }));
    rastrellieraLayer.getSource().addFeature(selectedMarkerFeature2);
    
    if (first) {
        let btnIniziaNavigazione = document.createElement('button');
        btnIniziaNavigazione.classList.add('elemCreato');
        btnIniziaNavigazione.textContent = "Inizia navigazione";
        const divInitNav = document.getElementById('btnIniziaNavigazione');
        divInitNav.appendChild(btnIniziaNavigazione);
        first = false;
        btnIniziaNavigazione.onclick = function() {
            let url = `https://www.google.com/maps/dir/?api=1&origin=${latitudeStart},${longitudeStart}&destination=${latitudeDestiantion},${longitudeDestiantion}&waypoints=${minDistanceElement1.latitude},${minDistanceElement1.longitude}|${minDistanceElement2.latitude},${minDistanceElement2.longitude}&travelmode=bicycling`;        
            console.log(url);
            window.open(url);
        };    
    }
    hideSpinner();
}

async function stazioneBikeSharing() {
    resetMappa();
    rimuoviElementiCreati();
    const position = await requestLocation();
        
    //posizione reale
    //latitude = position.coords.latitude; 
    //longitude = position.coords.longitude;
    latitude = 46.069169527542655;
    longitude = 11.127596809959554;

    if(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX){
        ricercaStralli(latitude, longitude);
    }else{
        alert("La tua posizione è al di fuori dell'area consentita");
    }
}

async function tragittoInteroBikeSharing() {
    resetMappa();
    rimuoviElementiCreati();
    const startPosition = await requestLocation();
    //creaLabelDestinazioneStallo(startPosition.coordinates.latitude, startPosition.coordinates.longitude);
    creaLabelDestinazioneStallo(46.069169527542655, 11.127596809959554);

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
    //ricercaStrallo(startPosition.coords.latitude, startPosition.coords.longitude, latDest, lonDest)
    ricercaStrallo(46.069169527542655, 11.127596809959554, latDest, lonDest)

    }else{
        resultElement.innerHTML='Posizione al di fuori dell\'area consentita'
        resultElement.style.color = 'red';
    }
    });

    // Impedisci lo scorrimento della mappa con la rotellina del mouse
    document.getElementById('mappaRastrelliera').addEventListener('wheel', function (event) {
        event.preventDefault();
    }, { passive: false });
};

async function tutteRastrelliere(){
    showSpinner();

    resetMappa();
    rimuoviElementiCreati();

    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());

    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    const data = await chiamataAPIbiciPropriaAll();

    data.body.forEach(function(rastrelliera) {
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

async function tuttiBikeSharing(){
    showSpinner();

    resetMappa();
    rimuoviElementiCreati();

    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());

    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    const data = await chiamataAPISenzaBiciAll();

    data.body.forEach(function(rastrelliera) {
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