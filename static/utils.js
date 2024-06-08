//const { Double } = require("mongodb");

function requestLocation() {
return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject);
    } else {
        reject(new Error("Geolocation is not supported by this browser."));
    }
});
}
async function getPosition(){
    try {
        const position = await requestLocation();
        console.log('Position:', position);
        return position;
    } catch (error) {
        console.error('Errore durante la richiesta della posizione:', error);

        if (error instanceof GeolocationPositionError) {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    alert('Per proseguire è necessario autorizzare l\'accesso alla posizione.');
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert('Posizione non disponibile.');
                    break;
                case error.TIMEOUT:
                    alert('Timeout nella richiesta della posizione.');
                    break;
                default:
                    alert('Errore sconosciuto durante la richiesta della posizione.');
                    break;
            }
        } else {
            alert('Errore generico: ' + error.message);
        }
    }
}

function inizializzaDivRes(){
    document.getElementById("initDivResult").textContent="Clicca qui per iniziare";
}

function showSpinner() {
    document.getElementById("spinner").style.display = "block";
}
// Nasconde la rotellina di attesa
function hideSpinner() {
    document.getElementById("spinner").style.display = "none";
}
async function resetMappa(){
    rastrellieraLayer.getSource().clear();
    markerDest.getSource().clear();
    markerLayer.getSource().clear();
}

function rimuoviElementiCreati() {
    const elementiDaRimuovere = document.querySelectorAll('.elemCreato');
    elementiDaRimuovere.forEach(elemento => {
        elemento.remove();
    });
    const elementiDaResettare= document.querySelectorAll('.elemRes');
    elementiDaResettare.forEach(elemento =>{
        elemento.textContent='';
    })


}

async function creaLabelDestinazione() {

return new Promise((resolve, reject) => {

    // Aggiunta del label, dell'input e del submit button al form
    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(submit);
    form.appendChild(resultElement);

    // Aggiunta del form al div container
    container.appendChild(form);

    document.getElementById('labelCliccaSuMappa').innerHTML="Oppure clicca sulla mappa sulla posizione desiderata";

    // Aggiungi l'event listener al form creato dinamicamente
    form.addEventListener('submit', function(event) {

    resetMappa();
    rimuoviElementiCreati()
    creaLabelDestinazione();
    event.preventDefault();

    const address = document.getElementById('addressInput').value;
    
    resultElement.innerHTML='';
    document.getElementById('titoloRastrelliere').innerHTML="";
    document.getElementById('rastrelliere').innerHTML="";

    if (address) {
        // Utilizzare il servizio di geocodifica Nominatim di OpenStreetMap
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;

        fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const place = data[0];
                const latitude = parseFloat(place.lat);
                const longitude = parseFloat(place.lon);
    
                if (LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX) {
                    // Le coordinate sono all'interno dell'area geografica
                    //resultElement.textContent = `Via trovata: ${place.display_name}`;
                    //resultElement.style.color = 'green';
                    latDest = latitude;
                    lonDest = longitude;
                    markerLayer.getSource().clear();
                    const marker = new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat([lonDest, latDest]))
                    });
    
                    const view = map.getView();
                    const newCenter = ol.proj.fromLonLat([lonDest, latDest]);
                    view.setCenter(newCenter);
                    view.setZoom(15);
    
                    markerLayer.getSource().addFeature(marker);
                    pulsanteConfermaDestinazione();
                    // resolve({ latitude, longitude });
                } else {
                    // Le coordinate sono al di fuori dell'area geografica
                    resultElement.textContent = 'Via al di fuori dell\'area consentita.';
                    resultElement.style.color = 'red';
                    // Non hai bisogno di chiamare reject qui poiché non sembra che stai utilizzando una promise esterna
                    //reject('via al di fuori')
                }
            } else {
                resultElement.textContent = 'Via non trovata. Verifica l\'indirizzo inserito.';
                resultElement.style.color = 'red';
                //reject('Via non trovata');
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

async function creaLabelDestinazioneStallo(latStart, lonStart) {

    return new Promise((resolve, reject) => {
    
        // Aggiunta del label, dell'input e del submit button al form
        form.appendChild(label);
        form.appendChild(input);
        form.appendChild(submit);
        form.appendChild(resultElement);

    
        // Aggiunta del form al div container
        container.appendChild(form);

        document.getElementById('labelCliccaSuMappa').innerHTML="Oppure clicca sulla mappa sulla posizione desiderata";
    
        // Aggiungi l'event listener al form creato dinamicamente
        form.addEventListener('submit', function(event) {
    
        resetMappa();
        event.preventDefault();
    
        const address = document.getElementById('addressInput').value;
        
        resultElement.innerHTML='';
        document.getElementById('titoloRastrelliere').innerHTML="";
        document.getElementById('rastrelliere').innerHTML="";
    
        if (address) {
            // Utilizzare il servizio di geocodifica Nominatim di OpenStreetMap
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;
    
            fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const place = data[0];
                    const latitude = parseFloat(place.lat);
                    const longitude = parseFloat(place.lon);
        
                    if (LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX) {
                        // Le coordinate sono all'interno dell'area geografica
                        //resultElement.textContent = `Via trovata: ${place.display_name}`;
                        //resultElement.style.color = 'green';
                        latDest = latitude;
                        lonDest = longitude;
                        markerDest.getSource().clear();
                        const marker = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([lonDest, latDest]))
                        });
        
                        const view = map.getView();
                        const newCenter = ol.proj.fromLonLat([lonDest, latDest]);
                        view.setCenter(newCenter);
                        view.setZoom(15);
        
                        markerDest.getSource().addFeature(marker);
                        pulsanteConfermaDestinazioneStallo(latStart, lonStart);
                        // resolve({ latitude, longitude });
                    } else {
                        // Le coordinate sono al di fuori dell'area geografica
                        resultElement.textContent = 'Via al di fuori dell\'area consentita.';
                        resultElement.style.color = 'red';
                        // Non hai bisogno di chiamare reject qui poiché non sembra che stai utilizzando una promise esterna
                    }
                } else {
                    resultElement.textContent = 'Via non trovata. Verifica l\'indirizzo inserito.';
                    resultElement.style.color = 'red';
                    // reject('Via non trovata');
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

async function creaLableInserisciRastrelliera(){
    return new Promise((resolve, reject) => {
    
        // Aggiunta del label, dell'input e del submit button al form
        formAggiungiRastrelliera.appendChild(labelAggiungiRastrelliera);
        formAggiungiRastrelliera.appendChild(inputAggiungiRastrelliera);
        formAggiungiRastrelliera.appendChild(submitAggiungiRastrelliera);
        formAggiungiRastrelliera.appendChild(resultElementAggiungiRastrelliera);
    
        // Aggiunta del form al div container
        containerAggiungiRastrelliera.appendChild(formAggiungiRastrelliera);
    
        // Aggiungi l'event listener al form creato dinamicamente
        formAggiungiRastrelliera.addEventListener('submit', function(event) {
    
        resetMappa();
        event.preventDefault();
    
        const address = document.getElementById('addressInput').value;
        
        resultElement.innerHTML='';
    
        if (address) {
            // Utilizzare il servizio di geocodifica Nominatim di OpenStreetMap
            const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&addressdetails=1`;
    
            fetch(url)
            .then(response => response.json())
            .then(async function (data){
                if (data.length > 0) {
                    const place = data[0];
                    const latitude = parseFloat(place.lat);
                    const longitude = parseFloat(place.lon);
        
                    if (LAT_INF <= latitude && latitude < LAT_SUP && LON_SX <= longitude && longitude < LON_DX) {
                        // Le coordinate sono all'interno dell'area geografica
                        //resultElement.textContent = `Via trovata: ${place.display_name}`;
                        //resultElement.style.color = 'green';
                        latDest = latitude;
                        lonDest = longitude;
                        markerDest.getSource().clear();
                        const marker = new ol.Feature({
                            geometry: new ol.geom.Point(ol.proj.fromLonLat([lonDest, latDest]))
                        });
        
                        const view = map.getView();
                        const newCenter = ol.proj.fromLonLat([lonDest, latDest]);
                        view.setCenter(newCenter);
                        view.setZoom(15);
        
                        markerDest.getSource().addFeature(marker);

                        await pulsanteInserisciRastrelliera(latDest, lonDest, place)                  
                        
                    } else {
                        // Le coordinate sono al di fuori dell'area geografica
                        resultElement.textContent = 'Via al di fuori dell\'area consentita.';
                        resultElement.style.color = 'red';
                        // Non hai bisogno di chiamare reject qui poiché non sembra che stai utilizzando una promise esterna
                    }
                } else {
                    resultElement.textContent = 'Via non trovata. Verifica l\'indirizzo inserito.';
                    resultElement.style.color = 'red';
                    // reject('Via non trovata');
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
async function pulsanteInserisciRastrelliera(latDest, lonDest, place){
    const btnConfermaDestinazione = document.createElement('button');
    btnConfermaDestinazione.classList.add('elemCreato', 'elemCreato', 'btn', 'btn-primary', 'mr-2');
    btnConfermaDestinazione.textContent = 'Conferma Posizione';
    btnConfermaDestinazione.type = 'submit';
    btnConfermaDestinazione.onclick = async function() {

        let rastrellieraGiàPresente =await chiamataAPIgestoreDatabase(latDest, lonDest);

        if(rastrellieraGiàPresente.body){
            alert("Rastrelliera già presente nel sistema")
            rimuoviElementiCreati();
            resetMappa();
        }else{
            if(place){
                alert("La tua richiesta di aggiunta rastrelliera in via: "+ place.display_name + " è stata inviata. L'amministratore provvederà alla verifica e all'inserimento della rastrelliera nei nostri database")
                rimuoviElementiCreati();
            }else{
                alert("La tua richiesta di aggiunta rastrelliera nella posizione: ["+ latDest+", "+ lonDest + " è stata inviata. L'amministratore provvederà alla verifica e all'inserimento della rastrelliera nei nostri database")
                rimuoviElementiCreati();
            }
            
        }
    };

    const divInitNav = document.getElementById('btnConfermaDestinazione');
    divInitNav.innerHTML = ''; // Rimuovi qualsiasi contenuto precedente
    divInitNav.appendChild(btnConfermaDestinazione);
}

function pulsanteConfermaDestinazione(){
    const btnConfermaDestinazione = document.createElement('button');
    btnConfermaDestinazione.classList.add('elemCreato', 'elemCreato', 'btn', 'btn-success', 'mr-2');
    btnConfermaDestinazione.textContent = 'Conferma Destinazione';
    btnConfermaDestinazione.type = 'submit';
    btnConfermaDestinazione.onclick = function() {
      ricercaRastrelliere(latDest, lonDest);
      rimuoviElementiCreati();
      creaLabelDestinazione();
    };

    const divInitNav = document.getElementById('btnConfermaDestinazione');
    divInitNav.innerHTML = ''; // Rimuovi qualsiasi contenuto precedente
    divInitNav.appendChild(btnConfermaDestinazione);
}

function pulsanteConfermaDestinazioneStallo(latStart, lonStart){
    const btnConfermaDestinazione = document.createElement('button');
    btnConfermaDestinazione.classList.add('elemCreato', 'elemCreato', 'btn', 'btn-success', 'mr-2');
    btnConfermaDestinazione.textContent = 'Conferma Destinazione';
    btnConfermaDestinazione.type = 'submit';
    btnConfermaDestinazione.onclick = function() {
      ricercaStallo(latStart, lonStart, latDest, lonDest);
      rimuoviElementiCreati();
      creaLabelDestinazioneStallo()
    };
    const divInitNav = document.getElementById('btnConfermaDestinazione');
    divInitNav.innerHTML = ''; // Rimuovi qualsiasi contenuto precedente
    divInitNav.appendChild(btnConfermaDestinazione);
}

function approxNcifre(num,n){
    var lonIntApprox = num * 10 * n;
    var lonRoundedApprox = Math.round(lonIntApprox);
    lonRoundedApprox=lonRoundedApprox/(10*n);
    return lonRoundedApprox;
}