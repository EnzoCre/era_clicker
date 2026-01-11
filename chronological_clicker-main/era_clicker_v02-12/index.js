const express = require('express');
 const cors = require('cors');

const app = express();
const { collection, collectionMessage } = require('./mongo');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post("/api/create", async (req, res) => {
    try { 
        const nouvelleSave = new collection(req.body); 
        await nouvelleSave.save();

        res.status(200).end();
    } catch (error) {
        console.error(error);
        res.status(500).end();
    }
});

app.get("/api/load/:pseudo", async (req, res) => {
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

app.post("/api/update/:pseudo", async (req, res) => {
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

app.get("/api/leaderboard",async (req,res) => {
    try {
        let leaderboardPlayers = await collection.find().sort({ knowledge : -1}).limit(10);

        res.status(200).json(leaderboardPlayers);
    } catch (error) {
        console.error("Erreur leaderboard:", error);
        res.status(500).end();
    }
});

app.post("/api/sendMessage", async(req, res) => {
    try {
        const nouvelleAttaque = new collectionMessage(req.body);
        await nouvelleAttaque.save();

        res.status(200).end();
    } catch(error) {
        console.error(error);
        res.status(500).end();
    }
});

app.get("/api/getOneAttack/:targetName", async (req,res) => {

    const target = req.params.targetName;
    let attacks = await collectionMessage.find({targetName : target});
    if(attacks.length > 0) {
        res.status(200).json(attacks);
    } else {res.status(404).json(attacks);}
    
    
})

app.listen(8080, () => {

    console.log("Server started on port : 8080");
    
});

