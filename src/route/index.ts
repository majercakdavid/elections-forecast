import express from 'express';
import { getManager, getRepository } from 'typeorm';
import { IClientForecastInput, IClientGetForecastInput } from '../interface/IClientForecast';

import Forecast from '../entity/Forecast';
import Party from '../entity/Party';
import UserForecast from '../entity/UserForecast';

const router = require('express').Router();

router.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send("Election Forecast API");
});

router.get('/all-parties', async (req: express.Request, res: express.Response) => {
    const parties = await getRepository(Party).find();
    res.json({ message: 'ok', data: parties });
});

router.post('/forecast', async (req: express.Request, res: express.Response) => {
    const clientUserForecast: IClientForecastInput = req.body;

    if (!clientUserForecast.id && !clientUserForecast.region) {
        throw new Error("Either id or region must be provided");
    }

    let forecastSum = 0;
    for (const f of clientUserForecast.forecasts) {
        forecastSum += f.percentage;
    }

    if (forecastSum !== 100) {
        throw new Error("The sum of all forecasts must be 100");
    }

    await getManager().transaction(async entityManager => {
        let userForecast = null;
        if (typeof clientUserForecast.region !== "undefined" && typeof clientUserForecast.id === "undefined") {

            if (typeof clientUserForecast.nickname === "undefined") {
                throw new Error("Nickname needs to be specified");
            }

            // Check whether the user already submitted a forecast
            const emailUserForecasts =
                await entityManager.getRepository(UserForecast).find({ email: clientUserForecast.email });
            if (emailUserForecasts.length !== 0) {
                throw new Error("The user with this email already exists!");
            }

            userForecast = new UserForecast();
            userForecast.email = clientUserForecast.email;
            userForecast.latestVersion = 1;
            userForecast.region = clientUserForecast.region;
            userForecast.nickname = clientUserForecast.nickname;
            await entityManager.save(userForecast);
            for (const f of clientUserForecast.forecasts) {
                const forecast = new Forecast();
                const party = await entityManager.getRepository(Party).findOne(f.id);

                if (!party) {
                    throw Error('Party with a given symbol, ' + f.id + ' ,could not be found!');
                }

                forecast.party = party;
                forecast.percentage = f.percentage;
                forecast.version = userForecast.latestVersion;
                forecast.userForecast = userForecast;
                await entityManager.save(forecast);
            }
        } else {
            userForecast = await entityManager.getRepository(UserForecast).findOneOrFail(clientUserForecast.id);

            if (typeof clientUserForecast.region !== 'undefined') {
                userForecast.region = clientUserForecast.region;
            }

            userForecast.latestVersion = userForecast.latestVersion + 1;
            for (const f of clientUserForecast.forecasts) {
                const forecast = new Forecast();
                const party = await entityManager.getRepository(Party).findOne(f.id);

                if (!party) {
                    throw Error('Party with a given symbol, ' + f.id + ' ,could not be found!');
                }

                forecast.percentage = f.percentage;
                forecast.version = userForecast.latestVersion;
                forecast.userForecast = userForecast;
                await entityManager.save(forecast);
            }
            await entityManager.save(userForecast);
        }

        res.json({ message: 'ok', data: userForecast });
    });
});

router.get('/get-forecast', async (req: express.Request, res: express.Response) => {
    const clientGetForecast: IClientGetForecastInput = req.query;
    if (!clientGetForecast.id) {
        throw new Error('UUID needs to be specified to retrieve forecast');
    }

    const clientUserForecast = await getRepository(UserForecast)
        .findOne(clientGetForecast.id);

    if (!clientUserForecast) {
        throw new Error('User with specified email does not exist!');
    }

    const forecasts = await getRepository(Forecast).find({
        userForecast: clientUserForecast,
        version: clientUserForecast.latestVersion,
        relations: ["party"],
    });

    res.json({ message: 'ok', data: forecasts });
});

export default router;
