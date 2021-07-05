const mongoose = require('mongoose');
const cors = require('cors');
const app = require('./app');
app.use(cors());
require('dotenv').config();

// Assign of server port, otherwise set port to 3999
const port = process.env.PORT || 3999;

// Setting conection string to mongo db
const MONGODB_URI = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@codigomagdiel.ykkas.mongodb.net/${process.env.MONGODB_NAME}?retryWrites=true&w=majority`;

//Stablishing connection to database
mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then((db) => {
        console.log('Mongodb is connected to', db.connection.host);

        //Create server
        app.listen(port, () => {
            console.log('The server http://localhost:' + port + ' is online.');
        });
    })

    .catch((err) => console.error(err));
