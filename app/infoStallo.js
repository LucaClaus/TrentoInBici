const express = require('express');
const router = express.Router();

router.post('', async (req, res) => {
    const id = req.body.id;
    let numPostiLiberi = Math.floor(Math.random()*11);
    let numBiciDisponibili = Math.floor(Math.random()*11);
    if(id == null) {
        res.status(400).json({ message: 'Id not found in the system' });
        return;
    }
    const idExists = await checkIdExists(id);
    if (!idExists) {
        // Se l'id non esiste, invia un messaggio di errore
        res.status(400).json({ message: 'Id not found in the system' });
        return;
    }
    res.status(200).json({ message: 'Id received successfully', body: {numPostiLiberi, numBiciDisponibili}});
});

async function checkIdExists(id) {
    /*return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, 100);
    });*/
    if(id > 30 || id < 1) return false;
    return true
}

module.exports = router;