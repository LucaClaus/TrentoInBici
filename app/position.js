const express = require('express');
const router = express.Router();


router.post('', async (req, res) => {

    const position = req.body.position;
    
    
    // Process the position data here

    res.status(200).json({ message: 'Position received successfully', body: position});
    console.log(position);
});


router.post('/dest', async (req, res) => {

	

    /**
     * Link to the newly created resource is returned in the Location header
     * https://www.restapitutorial.com/lessons/httpmethods.html
     */
    res.location("/api/v1/position/" + bookId).status(201).send();
});


module.exports = router;