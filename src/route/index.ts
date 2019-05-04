import express from 'express';
import { getManager, getRepository } from 'typeorm';
import Forecast from '../entity/Forecast';
import Party from '../entity/Party';
import UserForecast from '../entity/UserForecast';
import {IClientForecastInput, IClientGetForecastInput, IClientUpdateForecastInput} from '../interface/IClientForecast';
import {evaluateForecasts, validateEmail, validateForecasts, validateRegion} from "../utils/validation.utils";

const router = require('express').Router();

router.get('/', (req: express.Request, res: express.Response) => {
    res.status(200).send("Election Forecasts API");
});

router.get('/all-parties', async (req: express.Request, res: express.Response) => {
    const parties = await getRepository(Party).find();
    res.json({ message: 'ok', data: parties });
});

router.patch('/forecast', async (req: express.Request, res: express.Response) => {
    const clientUpdateForecast: IClientUpdateForecastInput = req.body;

    if (!clientUpdateForecast.id) {
        res.status(400).send("it's not possible to handle the request");
        return;
    }

    if (!validateForecasts(clientUpdateForecast.forecasts)) {
        res.status(400).send("forecasts not valid");
        return;
    }

    const valid = evaluateForecasts(clientUpdateForecast.forecasts);

    await getManager().transaction(async entityManager => {
        const userForecast = await entityManager.getRepository(UserForecast).findOne(clientUpdateForecast.id).catch(
            () => {
                // if the uuid is not in the right format it will fail without returning null
                return null;
            },
        ).then((value) => {
            return value;
        });

        if (!userForecast) {
            res.status(400).send('uuid not valid!');
            return;
        }

        userForecast.latestVersion = userForecast.latestVersion + 1;
        const predictions = [];

        for (const f of clientUpdateForecast.forecasts) {
            const forecast = new Forecast();
            const party = await entityManager.getRepository(Party).findOne(f.id).catch(
                () => {
                    return null;
                },
            );

            if (!party) {
                res.status(400).send('fuck!');
                return;
            }

            forecast.valid = valid;
            forecast.party = party;
            forecast.percentage = f.percentage;
            forecast.version = userForecast.latestVersion;
            forecast.userForecast = userForecast;
            predictions.push(forecast);
        }
        await entityManager.save(userForecast);
        await entityManager.save(predictions);
        res.json({ message: 'forecast correctly updated.'});
    });

});

router.post('/forecast', async (req: express.Request, res: express.Response) => {
    const clientUserForecast: IClientForecastInput = req.body;

    if (!clientUserForecast.region || !clientUserForecast.email || !clientUserForecast.nickname
        || !validateEmail(clientUserForecast.email) || !validateRegion(clientUserForecast.region)) {
        res.status(400).send("problem with user info.");
        return;
        // throw new Error("Either id or region must be provided");
    }

    if (!validateForecasts(clientUserForecast.forecasts)) {
        res.status(400).send("forecasts not valid.");
        return;
    }

    const valid = evaluateForecasts(clientUserForecast.forecasts);

    await getManager().transaction(async entityManager => {

        // Check whether the user already submitted a forecast
        const emailUserForecasts =
            await entityManager.getRepository(UserForecast).findOne({email: clientUserForecast.email});

        if (emailUserForecasts) {
            res.status(400).send("email already in use.");
            return;
        }

        const nickname =
            await entityManager.getRepository(UserForecast).findOne({nickname: clientUserForecast.nickname});

        if (nickname) {
            res.status(400).send("nickname already in use.");
            return;
        }

        const userForecast = new UserForecast();
        userForecast.email = clientUserForecast.email;
        userForecast.latestVersion = 1;
        userForecast.region = clientUserForecast.region;
        userForecast.nickname = clientUserForecast.nickname;
        const predictions = [];
        for (const f of clientUserForecast.forecasts) {
            const forecast = new Forecast();
            const party = await entityManager.getRepository(Party).findOne(f.id);

            if(!party) {
                res.status(400).send("fuck!");
                return;
            }

            forecast.valid = valid;
            forecast.party = party;
            forecast.percentage = f.percentage;
            forecast.version = userForecast.latestVersion;
            forecast.userForecast = userForecast;

            predictions.push(forecast);
        }
        // todo: what happen if it fail in saving?
        await entityManager.save(userForecast);
        await entityManager.save(predictions);
        res.json({ message: 'forecast correctly saved.', data: {uuid: userForecast.id }});
    });
});

router.get('/get-forecast', async (req: express.Request, res: express.Response) => {
    const clientGetForecast: IClientGetForecastInput = req.query;

    if (!clientGetForecast.id) {
        res.status(400).send("it's not possible to handle the request");
        return;
    }

    const clientUserForecast = await getRepository(UserForecast)
        .findOne(clientGetForecast.id).catch(
            () => {
                // if the uuid is not in the right format it will fail without returning null
                return null;
            },
        ).then((value) => {
            return value;
        });

    if (!clientUserForecast) {
        res.status(400).send('error while retrieving the forecast.');
        return;
        // throw new Error('Forecast with specified uuid does not exist!');
    }

    const forecasts = await getRepository(Forecast).find({
        relations: ['party'],
        select: ["percentage", "party"],
        where: {
            userForecast: clientUserForecast,
            version: clientUserForecast.latestVersion,
        },
    });

    res.json({ message: 'forecast retrieved correctly', data: forecasts });
});

export default router;
