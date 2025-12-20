const express = require('express');
const mongoose = require('mongoose'); 
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

mongoose.connect('mongodb+srv://Flowarin:sagisagi@clustertesthtml.v5zecsu.mongodb.net/?appName=ClusterTestHTML')
.then(() => console.log("Connection to mongoDB established"))
.catch((err) => console.log("Connection to mongoDB failed"))

app.listen(8080, () => {

    console.log("Server started on port : 8080");
    
});