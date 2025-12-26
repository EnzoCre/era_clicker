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
    knowledge: Number,
    kps: Number,
    clickValue : Number,
})

const collection = new mongoose.model("testSave",saveSchema)

module.exports=collection