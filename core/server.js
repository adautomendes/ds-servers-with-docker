const express = require(`express`);
const mongoose = require(`mongoose`);
require(`dotenv`).config();

const routes = require(`./routes`);
const DB = require(`./src/database/config`);
const Logger = require(`./src/logger`)(`[SERVER]`);

const server = express();

server.use(express.json());
server.use(routes);

mongoose.connect(DB.DB_URL, DB.DB_SETTINGS, (err) => {
    if(!err) {
        Logger.print(`Connected to MongoDB`);
    } else {
        Logger.print(`Error while connecting to MongoDB.\n${err}`);
    }
});

server.listen(process.env.PORT, () => {
    Logger.print(`Core server running at port ${process.env.PORT}`)
});