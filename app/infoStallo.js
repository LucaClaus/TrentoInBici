const express = require('express');
const router = express.Router();

router.post('', async (req, res) => {
    const id = req.body.id;
    let numPostiLiberi = Math.floor(Math.random()*11);
    let numBiciDisponibili = Math.floor(Math.random()*11);
    
    res.status(200).json({ message: 'Id received successfully', body: {numPostiLiberi, numBiciDisponibili}});
});

module.exports = router;