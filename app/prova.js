const express = require('express');
const router = express.Router();

router.post('', async (req, res) => {

    const emailProva = req.body.email;

    
    // Process the position data here

    res.status(200).json({ message: 'Email prova ricevuta' });
	console.log("prova ricevuta");
});


module.exports = router;