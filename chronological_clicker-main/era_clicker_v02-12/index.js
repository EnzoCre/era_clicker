const express = require('express');
 const cors = require('cors');

const app = express();
const collection = require('./mongo')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/api/save', async (req, res) => {
    try {
        console.log("Données reçues du jeu :", req.body); 
        const nouvelleSave = new collection(req.body);
        await nouvelleSave.save();

        res.status(200).json({ message: "Sauvegarde réussie !" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la sauvegarde" });
    }
});


app.listen(8080, () => {

    console.log("Server started on port : 8080");
    
});

