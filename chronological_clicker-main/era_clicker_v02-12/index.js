const express = require('express');
 const cors = require('cors');

const app = express();
const collection = require('./mongo')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/api/create', async (req, res) => {
    try { 
        const nouvelleSave = new collection(req.body); 
        await nouvelleSave.save();

        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

app.get('/api/load/:pseudo', async (req, res) => {
    try {
        const pseudoCherche = req.params.pseudo;

        const sauvegarde = await collection.findOne({ playerName: pseudoCherche });

        if (sauvegarde) {
            res.status(200).json(sauvegarde);
        } else {
            res.status(404).end();
        }

    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

app.post('/api/save/:pseudo', async (req, res) => {
    try {
        const pseudo = req.params.pseudo; 
        const stats = req.body;              

        const result = await collection.updateOne(
            { playerName: pseudo },     
            { $set: stats } 
        );

        if (result.matchedCount == 0) {
            return res.status(404).end();
        }

        res.status(200).end();

    } catch (error) {
        console.error("Erreur save:", error);
        res.status(500).end();
    }
});


app.listen(8080, () => {

    console.log("Server started on port : 8080");
    
});

