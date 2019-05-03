// Needed for the TypeORM
import 'reflect-metadata';

// Start WebSockets
import './websockets';

import * as bodyParser from 'body-parser';
import express from 'express';
import { createConnection } from 'typeorm';

import routes from './route';

require('dotenv').config();
const app = express();
const port = 3000;

// createConnection method will automatically read connection options
// from your ormconfig file or environment variables
createConnection().then(connection => {
    console.log('Successfully connected to PG database!');
    console.log('Entities: ' + connection.entityMetadatas.map(v => v.name));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/', routes);
    // app.get('/', (req, res) => res.status(200).send("Election API"));

    const server = app.listen(port, 'localhost', () => {
        if (server !== null) {
            console.log("app running on port.", server.address());
        }
        app.emit("appStarted");
    });
}).catch(reason => {
    console.log(reason);
});

export default app;
