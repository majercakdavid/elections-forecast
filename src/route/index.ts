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

    if (!clientUpdateForecast.id || !clientUpdateForecast.forecasts) {
        res.status(400).send("impossibile gestire la richiesta.");
        return;
    }

    if (!validateForecasts(clientUpdateForecast.forecasts)) {
        res.status(400).send("pronostico non valido.");
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
            res.status(400).send('id non valido.');
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
                res.status(500).send('fuck!');
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
        res.json({ message: 'pronostico aggiornato correttamente.'});
    });

});

router.post('/forecast', async (req: express.Request, res: express.Response) => {
    const clientUserForecast: IClientForecastInput = req.body;

    if (!clientUserForecast.region || !clientUserForecast.email || !clientUserForecast.nickname
        || !validateEmail(clientUserForecast.email) || !validateRegion(clientUserForecast.region)) {
        res.status(400).send("informazioni utente non valide.");
        return;
        // throw new Error("Either email or region must be provided");
    }

    if (!validateForecasts(clientUserForecast.forecasts)) {
        res.status(400).send("pronostico non valido.");
        return;
    }

    const valid = evaluateForecasts(clientUserForecast.forecasts);

    await getManager().transaction(async entityManager => {

        // Check whether the user already submitted a forecast
        const emailUserForecasts =
            await entityManager.getRepository(UserForecast).findOne({email: clientUserForecast.email});

        if (emailUserForecasts) {
            res.status(400).send("email già utilizzata.");
            return;
        }

        const nickname =
            await entityManager.getRepository(UserForecast).findOne({nickname: clientUserForecast.nickname});

        if (nickname) {
            res.status(400).send("nickname già utilizzato.");
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
                res.status(500).send("fuck!");
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
        res.json({ message: 'pronostico salvato correttamente.', data: {}});
    });
});

router.get('/get-forecast', async (req: express.Request, res: express.Response) => {
    const clientGetForecast: IClientGetForecastInput = req.query;

    if (!clientGetForecast.nickname) {
        res.status(400).send("nickname non valido.");
        return;
    }

    const clientUserForecast = await getRepository(UserForecast)
        .findOne({nickname: clientGetForecast.nickname});

    if (!clientUserForecast) {
        res.status(400).send('il nickname non è associato a nessun pronostico.');
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

    res.json({ message: 'pronostico recuperato correttamente.', data: {forecast: forecasts, uuid: clientUserForecast.id}});
});

export default router;
