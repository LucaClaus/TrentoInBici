const express = require('express');
const router = express.Router();

//const Rastrelliera = require('./models/rastrelliere'); // get our mongoose model
var mongoose = require('mongoose');
//const rastrelliere = require('../models/rastrelliere');

var Schema = mongoose.Schema;

// set up a mongoose model
const rastrellieraDaAggiungere = mongoose.model('rastrelliereDaAggiungeres', new Schema({ 
	id: String,
    latitude: Number,
    longitude: Number,
}));

let rastrelliere;


if (mongoose.models.rastrellieres) {
    rastrelliere = mongoose.model('rastrellieres');
} else {
    rastrelliere = mongoose.model('rastrellieres', yourSchema);
}

router.post('', async (req, res) => {
    const position = req.body.position;
    let rastrellieraGiàPresente = false;
    const rastrellieres = await rastrelliere.find({});

    for (let i = 0; i < rastrellieres.length; i++) {
        const rastrelliera = rastrellieres[i];
        const distance = calculateDistance(position.latitude, position.longitude, rastrelliera.latitude, rastrelliera.longitude);
        if (distance <= 0.05) { // 0.02 km = 20 meters
            console.log('Rastrelliera trovata:');
            rastrellieraGiàPresente = true;
            break;
        }
    }
    if (!rastrellieraGiàPresente) {
        console.log('Nessuna rastrelliera trovata con queste coordinate');
        const numRastrelliere = await rastrellieraDaAggiungere.countDocuments();
        const newRastrelliera = new rastrellieraDaAggiungere({
            id: numRastrelliere + 1,
            latitude: position.latitude,
            longitude: position.longitude,
        });
        // Save the new rastrelliera to the database
        await newRastrelliera.save();
        console.log('New rastrelliera added:');
    }
    console.log("data tragitto intero: ", rastrellieraGiàPresente)
    res.status(200).json({ message: 'Position received successfully', body: rastrellieraGiàPresente });
});

function aggiungiRastrelliera(){
    console.log('Aggiungi rastrelliera');
    rastrelliere = riceviRastrelliere()
}

async function riceviRastrelliere(){
    const collectionName = rastrelliere.collection.name;
    console.log('Il modello "rastrelliere" è associato alla collezione:', collectionName);
    let rast = await rastrelliere.find({});
    rast = rast.map( (rastrelliera) => {
        return {
            id: rastrelliera.id,
            latitude: rastrelliera.latitude,
            longitude: rastrelliera.longitude,
        };
        
    });
    return rast;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

module.exports = router;