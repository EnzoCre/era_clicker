const mongoose = require('mongoose'); 


mongoose.connect('mongodb+srv://Flowarin:sagisagi@clustertesthtml.v5zecsu.mongodb.net/?appName=ClusterTestHTML')
.then(() => 
    {console.log("Connection to mongoDB established")

})
.catch((err) => 
    {console.log("Connection to mongoDB failed")
})

const saveSchema = new mongoose.Schema({

    playerName: String,
    playerPassword: String,
    knowledge: Number,
    kps: Number,
    clickValue : Number,
    maxEraReached : String,
    upgrades : Object,
})

const messageSchema = new mongoose.Schema({

    senderName: String,
    targetName: String,
    message: String,
    attackValue: Number,

})

const collection = new mongoose.model("testSave",saveSchema);

const collectionMessage = new mongoose.model("AttackMessage", messageSchema);

module.exports = { collection, collectionMessage };


