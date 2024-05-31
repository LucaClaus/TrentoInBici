const { Double } = require("mongodb");

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
function rimuoviElementiCreati() {
    const elementiDaRimuovere = document.querySelectorAll('.elemCreato');
    elementiDaRimuovere.forEach(elemento => {
        elemento.remove();
    
    const elementiDaResettare= document.querySelectorAll('.elemRes');
    elementiDaResettare.forEach(elemento =>{
        elemento.textContent='';
    })
});
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

    // Aggiungi l'event listener al form creato dinamicamente
    form.addEventListener('submit', function(event) {

    resetMappa();
    event.preventDefault();

    const address = document.getElementById('addressInput').value;
    
    resultElement.innerHTML='';

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
                    pulsanteConfermaDestinazione();
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

async function resetMappa(){
    rastrellieraLayer.getSource().clear();
    markerDest.getSource().clear();
    markerLayer.getSource().clear();
}

function pulsanteConfermaDestinazione(){
    const btnConfermaDestinazione = document.createElement('button');
    btnConfermaDestinazione.classList.add('elemCreato');
    btnConfermaDestinazione.textContent = 'Conferma Destinazione';
    btnConfermaDestinazione.type = 'submit';
    btnConfermaDestinazione.onclick = function() {
      ricercaRastrelliere(latDest, lonDest);
    };

    const divInitNav = document.getElementById('btnConfermaDestinazione');
    divInitNav.innerHTML = ''; // Rimuovi qualsiasi contenuto precedente
    divInitNav.appendChild(btnConfermaDestinazione);

}