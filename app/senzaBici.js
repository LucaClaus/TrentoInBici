const express = require('express');
const router = express.Router();
const axios = require('axios');

//numero di stralli da mandare a OSRM
const RASTRELLIERE_CALCOLATE_GEOMETRICAMENTE=5;
const LAT_SUP=46.1331;
const LAT_INF=46.0284;
const LON_SX= 11.0819;
const LON_DX=11.1582;

//const Rastrelliera = require('./models/rastrelliere'); // get our mongoose model
var mongoose = require('mongoose');
//const rastrelliere = require('../models/rastrelliere');
var Schema = mongoose.Schema;

// set up a mongoose model
const stralli = mongoose.model('strallis', new Schema({ 
	id: String,
    latitude: Number,
    longitude: Number,
}));

const stralloFrontEnd = {
    id: String,
    latitude: Number,
    longitude: Number,
    distance: Number,
    travelTime: Number
};

router.post('', async (req, res) => {

    const position = req.body.position;

    //se manca la posizione ritorna errore
    if(!position || position.latitude==null || position.longitude==null){
        res.status(400).json({ error: 'NO Position'});
        return
    }

    //se la posizione data è la di fuori del comune di Trento torna errore
    if(!(LAT_INF <= position.latitude && position.latitude < LAT_SUP) || !(LON_SX <= position.longitude && position.longitude < LON_DX)){
        res.status(401).json({ error: 'La posizione non è compresa nel comune di Trento'});
        return
    }
    //ricevi dal database tutti gli stralli
    let tuttiStralli =await riceviStralli();

    //calcola le STRALLI_CALCOLATE_GEOMETRICAMENTE stralli piu vicini alla posizione geometricamente
    let stralliPiuViciniGeometricamente = await strPiuVicineGeometricamente(position, tuttiStralli);

    //funzione che calcola le 5 rastrelliere più vicine da mostrare all'utente, da ritornare: posizione, distanza dalla posizione dell'utente chiamando OSRM
    let distances = await getDistancesFromPosition(position, stralliPiuViciniGeometricamente);
    res.status(200).json({ message: 'Position received successfully', body: distances });
});

async function riceviStralli(){
    const collectionName = stralli.collection.name;
    console.log('Il modello "stralli" è associato alla collezione:', collectionName);
    let str = await stralli.find({});
    str = str.map( (strallo) => {
        return {
            id: strallo.id,
            latitude: strallo.latitude,
            longitude: strallo.longitude,
        };
    });
    return str;
}

async function strPiuVicineGeometricamente(position, tuttiStralli){
    let distanze = [];
    for (let i = 0; i < tuttiStralli.length; i++) {
        let dist = await calcolaDistanzaGeometrica(position.latitude, position.longitude, tuttiStralli[i].latitude, tuttiStralli[i].longitude);
        distanze.push({ distanza: dist, rast: tuttiStralli[i] });
    }
    
    distanze.sort((a, b) => a.distanza - b.distanza);

    let distanzeMinori = distanze.slice(0, RASTRELLIERE_CALCOLATE_GEOMETRICAMENTE).map(item => item.rast);

    return distanzeMinori;
}

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
     let treRastrellierePiùVicine = distances.slice(0, 3);
    
    return treRastrellierePiùVicine;
}

module.exports = router;