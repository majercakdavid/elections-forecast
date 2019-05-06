// Needed for the TypeORM
import 'reflect-metadata';

import * as bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { createConnection } from 'typeorm';

import routes from './route';

require('dotenv').config();
const app = express();
const port = 3000;

// createConnection method will automatically read connection options
// from your ormconfig file or environment variables
createConnection().then(connection => {
    // cors
    app.use(cors());
    console.log('Successfully connected to PG database!');
    console.log('Entities: ' + connection.entityMetadatas.map(v => v.name));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.use('/forecast-service', routes);
    app.get('/', (req, res) => res.send('Elections Api'));
    app.get('/*', (req, res) => res.status(404).send('Resource not found.'));

    const server = app.listen(port, '0.0.0.0', () => {
        if (server !== null) {
            console.log("app running on port.", server.address());
        }
        app.emit("appStarted");
    });
}).catch(reason => {
    console.log(reason);
});

export default app;
