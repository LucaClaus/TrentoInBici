const express = require('express');
const router = express.Router();
const axios = require('axios');

//numero di rastrelliere da mandare a OSRM (10 ci mette 5 sec, 5 ce ne mette la metà)
const RASTRELLIERE_OSRM=5;
const LAT_SUP=46.1331;
const LAT_INF=46.0284;
const LON_SX= 11.0819;
const LON_DX=11.1582;

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

    //se manca la posizione ritorna errore
    if(!position || position.latitude==null || position.longitude==null){
        res.status(400).json({ error: 'NO Position'});
        return
    }

    //se la posizione data è la di fuori del comune di Trento torna errore
    if(!(LAT_INF <= position.latitude && position.latitude < LAT_SUP) || !(LON_SX <= position.longitude && position.longitude < LON_DX)){
        res.status(401).json({ error: 'La posizione non è compresa nel comune di Trento'});
        console.log("posizione fuori dall'area");
        return
    }

    //ricevi dal database tutte le rastrelliere
    let tutteRastrelliere=await riceviRastrelliere();    
    //calcola le 10 rastrelliere piu vicine alla posizione geometricamente
    let dieciRastrellierePiùVicine = await rastPiuVicine10(position, tutteRastrelliere);

    console.log("Distanze calcolate geometricamente");
    for(let i=0; i<dieciRastrellierePiùVicine.length;i++){
        console.log(dieciRastrellierePiùVicine[i].id);
    }

    //funzione che calcola le 5 rastrelliere più vicine da mostrare all'utente, da ritornare: posizione, distanza dalla posizione dell'utente chiamando OSRM
    let distances = await getDistancesFromPosition(position, dieciRastrellierePiùVicine);
    
    console.log("Distanze calcolate con l'osmr");
    for(let i=0; i<distances.length;i++){
        console.log(distances[i].id + " " + distances[i].distance);
    }
    console.log(distances);
    res.status(200).json({ message: 'Position received successfully', body: distances });
});







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

async function rastPiuVicine10(position, tutteRast){
    let distanze = [];

    for (let i = 0; i < tutteRast.length; i++) {
        let dist = await calcolaDistanzaGeometrica(position.latitude, position.longitude, tutteRast[i].latitude, tutteRast[i].longitude);
        distanze.push({ distanza: dist, rast: tutteRast[i] });
    }
    for(let i=0;i<distanze.length;i++){
        console.log("distanze: ", distanze[i].rast.id, distanze[i].distanza);
    }
    

    distanze.sort((a, b) => a.distanza - b.distanza);

    // Prendi solo i primi 5 elementi dell'array ordinato
    let distanzeMinori = distanze.slice(0, RASTRELLIERE_OSRM).map(item => item.rast);

    return distanzeMinori;
}

//calcolare geometricamente le 10 rastrelliere più vicine
async function calcolaDistanzaGeometrica(lat1, lon1, lat2, lon2) {
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
        let url = `http://router.project-osrm.org/route/v1/bike/${startPosition.longitude},${startPosition.latitude};${destination.longitude},${destination.latitude}?overview=false`;

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
     //ritorna le rastrelliere 
     distances.sort((a, b) => a.distance - b.distance);
     let cinqueRastrellierePiuVicine = distances.slice(0, 5);
    
    return cinqueRastrellierePiuVicine;
}

module.exports = router;