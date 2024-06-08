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

async function chiamataAPISenzaBiciI(latitude, longitude) {
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

 async function chiamataAPISenzaBiciII(latitudeStart, longitudeStart, latitudeDestination, longitudeDestination) {
    let positionStart = { latitude: latitudeStart, longitude: longitudeStart };
    let positionDestination = { latitude: latitudeDestination, longitude: longitudeDestination };
    try {
        const response = await fetch('/api/v1/senzaBici/tragittoIntero', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            
            body: JSON.stringify({ positionStart, positionDestination}),
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

async function chiamataAPIgestoreDatabase(latitude, longitude){
    try {
        const response = await fetch('/api/v1/gestoreDataBase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': loggedUser.token
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
  document.getElementById('titoloRastrelliere').innerHTML="";
  document.getElementById('rastrelliere').innerHTML="";

  //rimuoviElementiCreati();
  // Ottieni le coordinate del click
  const coordinates = event.coordinate;
  const transformedCoordinates = ol.proj.toLonLat(coordinates);
  
  // Salva le coordinate in latitudine e longitudine
  latDest = transformedCoordinates[1];
  lonDest = transformedCoordinates[0];
  console.log('Click registered at:', coordinates, 'Lat/Lon:', latDest, lonDest);

  // Rimuovi i marker esistenti
  markerLayer.getSource().clear();

  if(LAT_INF <= latDest && latDest < LAT_SUP && LON_SX <= lonDest && lonDest < LON_DX){
    const marker = new ol.Feature({
      geometry: new ol.geom.Point(coordinates)
  });

  // Aggiungi il nuovo marker al layer
  markerLayer.getSource().addFeature(marker);

  pulsanteConfermaDestinazione();
  creaLabelDestinazione();

  }else{
    rimuoviElementiCreati();
    resultElement.innerHTML='Posizione al di fuori dell\'area consentita'
    resultElement.style.color = 'red';
    creaLabelDestinazione();
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
  
  /*const positionLabel= document.getElementById('position');
  positionLabel.innerHTML = "Posizione: [" + latitude + ", " + longitude + "]";*/
  
  const view = map.getView();
  const newCenter = ol.proj.fromLonLat([longitude, latitude]);
  view.setCenter(newCenter);
  view.setZoom(15);
  
  // Aggiunta dei controlli alla mappa
  map.addControl(new ol.control.ScaleLine());
  map.addControl(new ol.control.MousePosition());
  //map.addControl(new ol.control.LayerSwitcher());

  // Aggiunta del marker centrale
 const centerFeature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
  });
  markerLayer.getSource().addFeature(centerFeature);
  
  // Chiamata all'API per ottenere i dati delle rastrelliere
  const data = await chiamataAPIbiciPropria(latitude, longitude);
  
  titoloRastrelliere = document.getElementById("titoloRastrelliere");
  titoloRastrelliere.textContent="Rastrelliere più vicine";
  
  let lonSelected;
  let latSelected;

  data.body.forEach(function(rastrelliera) {
      let btnRastrelliera = document.createElement('button');
      btnRastrelliera.classList.add('elemCreato', 'btn', 'btn-primary', 'mb-2');
      btnRastrelliera.style.display = 'block';
      btnRastrelliera.textContent = " Distanza: " + rastrelliera.distance + " m" + ", Tempo: " + approxNcifre((rastrelliera.travelTime/60),2) + " min";
  
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
                  lonLat[0]=approxNcifre(lonLat[0],7);
                  lonLat[1]=approxNcifre(lonLat[1],7);
                  lonSelected=approxNcifre(lonSelected,7);
                  latSelected=approxNcifre(latSelected,7);
  
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
              lonLat[0]=approxNcifre(lonLat[0],7);
              lonLat[1]=approxNcifre(lonLat[1],7);
              lonSelected=approxNcifre(lonSelected,7);
              latSelected=approxNcifre(latSelected,7);
  
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
              btnIniziaNavigazione.classList.add('elemCreato','btn', 'btn-success', 'mr-2');
              btnIniziaNavigazione.textContent = "Inizia navigazione";
              const divInitNav = document.getElementById('btnIniziaNavigazione');
              let labelInitNav=document.createElement('p');
              labelInitNav.classList.add('elemCreato')
              labelInitNav.textContent = "Cliccando su Inizia Navigazione verrai reindirizzato sul sito di Google Maps per raggiungere al meglio la destinazione selezionata. Segui il percorso con tutte le tappe!"
              divInitNav.appendChild(labelInitNav);
              divInitNav.appendChild(btnIniziaNavigazione);
              first = false;
              if(latDest==null||lonDest==null){
                    btnIniziaNavigazione.onclick = function() {
                    coordinatesGoogleMaps(selectedCoordinates[0], selectedCoordinates[1]);
                };
              }else{
                btnIniziaNavigazione.onclick = function() {
                    let url = `https://www.google.com/maps/dir/?api=1&destination=${latDest},${lonDest}&waypoints=${selectedCoordinates[0]},${selectedCoordinates[1]}&travelmode=bicycling`;        
                    latDest=null;
                    lonDest=null;
                    console.log(url);
                    window.open(url);
                };
              }
              
          }
      };
  
      ul.appendChild(btnRastrelliera);
  
  });
  
  hideSpinner();
  
  }

async function ricercaStalli(lat, lon){
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
  
  /*const positionLabel = document.getElementById('position');
  positionLabel.innerHTML = "Posizione: [" + latitude + ", " + longitude + "]";*/
  
  const view = map.getView();
  const newCenter = ol.proj.fromLonLat([longitude, latitude]);
  view.setCenter(newCenter);
  view.setZoom(15);
  
  // Aggiunta dei controlli alla mappa
  map.addControl(new ol.control.ScaleLine());
  map.addControl(new ol.control.MousePosition());
  //map.addControl(new ol.control.LayerSwitcher());
  
  // Aggiunta del marker centrale
  const centerFeature = new ol.Feature({
      geometry: new ol.geom.Point(ol.proj.fromLonLat([longitude, latitude]))
  });
  markerLayer.getSource().addFeature(centerFeature);

    // Chiamata all'API per ottenere i dati delle rastrelliere
    const data = await chiamataAPISenzaBiciI(latitude, longitude);
    console.log(data);

    titoloStralli = document.getElementById("titoloRastrelliere");
    titoloStralli.textContent="Stalli più vicini"

    let lonSelected;
    let latSelected;
  
    data.body.forEach(function(rastrelliera) {
      let btnRastrelliera = document.createElement('button');
      btnRastrelliera.classList.add('elemCreato', 'btn', 'btn-primary', 'mb-2');
      btnRastrelliera.style.display = 'block';
      btnRastrelliera.textContent = "Distanza: " + approxNcifre((rastrelliera.distance),2) + " km" + 
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
                  lonLat[0]=approxNcifre(lonLat[0],7);
                  lonLat[1]=approxNcifre(lonLat[1],7);
                  lonSelected=approxNcifre(lonSelected,7);
                  latSelected=approxNcifre(latSelected,7);
  
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
              lonLat[0]=approxNcifre(lonLat[0],7);
              lonLat[1]=approxNcifre(lonLat[1],7);
              lonSelected=approxNcifre(lonSelected,7);
              latSelected=approxNcifre(latSelected,7);
  
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
              btnIniziaNavigazione.classList.add('elemCreato','btn', 'btn-success', 'mr-2');
              btnIniziaNavigazione.textContent = "Inizia navigazione";
              const divInitNav = document.getElementById('btnIniziaNavigazione');
              let labelInitNav=document.createElement('p');
              labelInitNav.classList.add('elemCreato')
              labelInitNav.textContent = "Cliccando su Inizia Navigazione verrai reindirizzato sul sito di Google Maps per raggiungere al meglio la destinazione selezionata. Segui il percorso con tutte le tappe!"
              divInitNav.appendChild(labelInitNav);
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

  async function stazioneBikeSharing() {
    resetMappa();
    rimuoviElementiCreati();
    document.getElementById("divResult").style.display="block";
    const position = await requestLocation();
        
    //posizione reale
    //latitude = position.coords.latitude; 
    //longitude = position.coords.longitude;
    latitude = 46.069169527542655;
    longitude = 11.127596809959554;

    if(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX){
        ricercaStalli(latitude, longitude);
    }else{
        alert("La tua posizione è al di fuori dell'area consentita");
    }
}

async function ricercaStallo(latS, lonS, latD, lonD){
    showSpinner();
    const ul = document.getElementById('rastrelliere'); // Lista per visualizzare i dati delle rastrelliere
    ul.textContent = '';
    let latitudeStart = latS;
    let longitudeStart = lonS;
    let latitudeDestination = latD;
    let longitudeDestination= lonD;
    let first = true;

    document.getElementById('mappaRastrelliera').addEventListener('wheel', function(event) {
        event.preventDefault();
    }, { passive: false });

    const positionLabelStart = document.getElementById('position');
    

    // Aggiunta dei controlli alla mappa
    map.addControl(new ol.control.ScaleLine());
    map.addControl(new ol.control.MousePosition());
    
    // Aggiunta del marker centrale
    const centerFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([longitudeStart, latitudeStart]))
    });
    markerLayer.getSource().addFeature(centerFeature);

    // Chiamata all'API per ottenere i dati degli stralli
    const data = await chiamataAPISenzaBiciII(latitudeStart, longitudeStart, latitudeDestination, longitudeDestination);
    
    data.body.minDistance=approxNcifre(data.body.minDistance,2);
    data.body.minDuration=approxNcifre(data.body.minDuration,2);
    data.body.aPiedi.duration=approxNcifre(data.body.aPiedi.duration,2);
    data.body.aPiedi.distance=approxNcifre(data.body.aPiedi.distance,2);

    positionLabelStart.innerHTML = "Tempo e distanza di percorrenza usando le bici del bike sharing: " + data.body.minDuration + " min "+ data.body.minDistance + " km<br>"
                                   + " Tempo e distanza andando a piedi: " + data.body.aPiedi.duration + " min " + data.body.aPiedi.distance + " km";

    let tappa1 = data.body.bestStops[0];
    let tappa2 = data.body.bestStops[1];

    if(data.body.minDuration<=data.body.aPiedi.duration){
        positionLabelStart.innerHTML += "<br><br><br> Ti conviene il percorso Bike Sharing! <br> Sei più veloce di "+approxNcifre((data.body.aPiedi.duration-data.body.minDuration),2)+" min"
    }else{
        positionLabelStart.innerHTML += "<br><br><br> Ti conviene andare a piedi! <br> Sei più veloce di "+approxNcifre((data.body.minDuration-data.body.aPiedi.duration),2)+" min"
    }
    
    if(tappa1.latitude == tappa2.latitude && tappa1.longitude == tappa2.longitude){
        alert("Non ci sono due stalli che permettono di raggiungere la destinazione con una bici del bike sharing");
    }

    let selectedMarkerFeature1 = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([tappa1.longitude, tappa1.latitude])),
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
        geometry: new ol.geom.Point(ol.proj.fromLonLat([tappa2.longitude, tappa2.latitude])),
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
        btnIniziaNavigazione.classList.add('elemCreato','btn', 'btn-success', 'mb-2', 'initNav');
        btnIniziaNavigazione.textContent = "Inizia navigazione: percorso Bike Sharing";
        const divInitNav = document.getElementById('btnIniziaNavigazione');
        divInitNav.appendChild(btnIniziaNavigazione);
        first = false;
        btnIniziaNavigazione.onclick = function() {
            let url = `https://www.google.com/maps/dir/?api=1&destination=${latitudeDestination},${longitudeDestination}&waypoints=${tappa1.latitude},${tappa1.longitude}|${tappa2.latitude},${tappa2.longitude}&travelmode=bicycling`;        
            console.log(url);
            window.open(url);
        };    
        let btnIniziaNavigazionePiedi = document.createElement('button');
        btnIniziaNavigazionePiedi.classList.add('elemCreato','btn', 'btn-success', 'mr-2', 'initNav');
        btnIniziaNavigazionePiedi.textContent = "Inizia navigazione: a piedi";
        const divInitNavPiedi = document.getElementById('btnIniziaNavigazione');
        divInitNavPiedi.appendChild(btnIniziaNavigazionePiedi);
        btnIniziaNavigazionePiedi.onclick = function() {
            let url = `https://www.google.com/maps/dir/?api=1&destination=${latitudeDestination},${longitudeDestination}&travelmode=walking`;        
            console.log(url);
            window.open(url);
        }; 
    }
    hideSpinner();
}


async function tragittoInteroBikeSharing() {
    resetMappa();
    rimuoviElementiCreati();
    const startPosition = await requestLocation();
    
    //posizione reale
    //latitude = position.coords.latitude; 
    //longitude = position.coords.longitude;
    latitude = 46.069169527542655;
    longitude = 11.127596809959554;
    //creaLabelDestinazioneStallo(startPosition.coordinates.latitude, startPosition.coordinates.longitude);
    creaLabelDestinazioneStallo(latitude, longitude);

    map.on('click', async function (event) {

    resultElement.innerHTML='';
    document.getElementById('position').innerHTML="";
    const elementiDaRimuovere = document.querySelectorAll('.initNav');
    elementiDaRimuovere.forEach(elemento => {
        elemento.remove();
    });
    
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

    pulsanteConfermaDestinazioneStallo(latitude, longitude);
    creaLabelDestinazioneStallo();

    // Aggiungi il nuovo marker al layer
    markerDest.getSource().addFeature(marker);
    //ricercaStallo(startPosition.coords.latitude, startPosition.coords.longitude, latDest, lonDest)
    //ricercaStallo(latitude, longitude, latDest, lonDest)

    }else{
        rimuoviElementiCreati();
        resultElement.innerHTML='Posizione al di fuori dell\'area consentita'
        resultElement.style.color = 'red';
        creaLabelDestinazioneStallo();
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

async function aggiungiRastrelliera(){
    showSpinner();
    resetMappa();
    rimuoviElementiCreati();
    const position = await requestLocation();
      
    //posizione reale
    //latitude = position.coords.latitude; 
    //longitude = position.coords.longitude;
    latitude = 46.069169527542655;
    longitude = 11.127596809959554;

    if(LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX){
        await pulsanteInserisciRastrelliera(latDest, lonDest)
    }else{
      alert("La tua posizione è al di fuori dell'area consentita");
    }
    creaLableInserisciRastrelliera();
    hideSpinner();
}

async function utenteLoggato(){
    document.getElementById("emailLoggedUser").textContent="Benvenuto " + loggedUser.email;
    document.getElementById("btnLogin").style.display="none";
    document.getElementById("btnLogout").style.display="block";
    document.getElementById("btn8").style.display="block";
}

function resetTimeout() {
    clearTimeout(timeout);
    timeout = setTimeout(logout, loggedUser.sessionTime);
}

function logout() {
    alert("LOGOUT. Sarai reindirizzato alla pagina iniziale.");
    sessionStorage.removeItem("loggedUserEmail");
    sessionStorage.removeItem("loggedUserToken");
    sessionStorage.removeItem("loggedUserId");
    sessionStorage.removeItem("loggedUserSelf");
    sessionStorage.removeItem("loggedUserTime");
    window.location.href = "index.html";
}