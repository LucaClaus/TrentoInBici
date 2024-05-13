const express = require('express');
const router = express.Router();

router.post('', async (req, res) => {

     var end= req.body.destination;
    
    var directionsUrl = generateDirectionsUrl(end);

    res.status(200).json({ message: 'Navigation started', body: directionsUrl});
});


    function generateDirectionsUrl(destination) {

        return `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=bicycling`;
    }

    module.exports = router;