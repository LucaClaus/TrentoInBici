const express = require('express');
const router = express.Router();
const axios = require('axios');

//const Rastrelliera = require('./models/rastrelliere'); // get our mongoose model
var mongoose = require('mongoose');
//const rastrelliere = require('../models/rastrelliere');
var Schema = mongoose.Schema;

// set up a mongoose model
const rastrelliere = mongoose.model('rastrellieres', new Schema({ 
	id: String,
    latitude: Number,
    longitude: Number,
}));

const rastrellieraFrontEnd = {
    id: String,
    latitude: Number,
    longitude: Number,
    distance: Number,
    travelTime: Number
};

router.post('', async (req, res) => {

    const position = req.body.position;
    console.log("Coordinate Dispositivo: ", position);

    //ricevi dal database tutte le rastrelliere
    let tutteRastrelliere=await riceviRastrelliere();    
    //calcola le 10 rastrelliere piu vicine alla posizione da mandare a OSRM
    let dieciRastrellierePiùVicine = rastPiuVicine10(position, tutteRastrelliere);
    //funzione che calcola le 5 rastrelliere più vicine da mostrare all'utente, da ritornare: posizione, distanza dalla posizione dell'utente chiamando OSRM
    let distances = await getDistancesFromPosition(position, dieciRastrellierePiùVicine);
    //ritorna le rastrelliere 
    distances.sort((a, b) => a.distance - b.distance);
    let cinqueRastrellierePiuVicine = distances.slice(0, 5);
    res.status(200).json({ message: 'Position received successfully', body: cinqueRastrellierePiuVicine });});

//ricevere dal database tutte le rastrelliere
async function riceviRastrelliere(){

    const collectionName = rastrelliere.collection.name;
    console.log('Il modello "rastrelliere" è associato alla collezione:', collectionName);
    let rast = await rastrelliere.find({});
    //console.log(rast);
    rast = rast.map( (rastrelliera) => {
        return {
            id: rastrelliera.id,
            latitude: rastrelliera.latitude,
            longitude: rastrelliera.longitude,
        };
        
    });
    
    return rast;
}

function rastPiuVicine10(position, tutteRast){
    let distanze = [];

    for (let i = 0; i < tutteRast.length; i++) {
        let dist = calcolaDistanzaGeometrica(position.latitude, position.longitude, tutteRast[i].latitude, tutteRast[i].longitude);
        distanze.push({ distanza: dist, rast: tutteRast[i] });
    }

    distanze.sort((a, b) => a.distanza - b.distanza);

    // Prendi solo i primi 5 elementi dell'array ordinato
    let distanzeMinori = distanze.slice(0, 5).map(item => item.rast);

    return distanzeMinori;
}

//calcolare geometricamente le 10 rastrelliere più vicine
function calcolaDistanzaGeometrica(lat1, lon1, lat2, lon2) {
    // Converti gradi in radianti
    const deg2rad = Math.PI / 180;
    lat1 *= deg2rad;
    lon1 *= deg2rad;
    lat2 *= deg2rad;
    lon2 *= deg2rad;

    // Calcola la differenza di latitudine e longitudine
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    // Calcola la distanza tra i due punti utilizzando la formula dell'emissione sferica
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const radius = 6371; // Raggio medio della Terra in chilometri
    const dist = radius * c;

    return dist;
}

async function getDistancesFromPosition(startPosition, destinations) {
    let distances = [];

    for (let i = 0; i < destinations.length; i++) {
        let destination = destinations[i];

        // Prepare the URL for OSRM
        let url = `http://router.project-osrm.org/route/v1/bicycle/${startPosition.longitude},${startPosition.latitude};${destination.longitude},${destination.latitude}?overview=false`;

        // Use axios to send a GET request to the OSRM API
        let response = await axios.get(url);
        let route = response.data.routes[0];
        let distance = route.distance; // The distance is in meters
        let travelTime = route.duration; // The travel time is in seconds

        let rackWithDistanceTravelTime = {
            id: destination.id,
            latitude: destination.latitude,
            longitude: destination.longitude,
            distance: distance,
            travelTime: travelTime
        };
        // Add the object to the distances array
        distances.push(rackWithDistanceTravelTime);
    }
    return distances;
}
//collegarsi tramite API a OpenSourceRoutingMap che ritorna tutti i tragitti
//esempio richiesta get http://router.project-osrm.org/route/v1/bicycle/11.032779,46.364261;11.026274,46.326757?overview=false

//scegliere i migliori 5 tragitti e mostrare le descrizioni all'utente

//openstreetmap

module.exports = router;