
import express from 'express';
import { getManager, getRepository } from 'typeorm';

import { IClientForecastInput, IClientGetForecastInput } from './interface/IClientForecast';

import Forecast from './entity/Forecast';
import Party from './entity/Party';
import UserForecast from './entity/UserForecast';

const app = express();
const port = 3000;

app.get('/all-parties', async (req: express.Request, res: express.Response) => {
    const parties = await getRepository(Party).find();
    res.json({ message: 'ok', data: parties });
});

app.post('/forecast', async (req: express.Request, res: express.Response) => {
    const clientUserForecast: IClientForecastInput = req.body;

    if (!clientUserForecast.id && !clientUserForecast.region) {
        throw new Error("Either id or region must be provided");
    }
    await getManager().transaction(async entityManager => {
        let userForecast = null;
        if (typeof clientUserForecast.region !== "undefined" && typeof clientUserForecast.id === "undefined") {
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
            await entityManager.save(userForecast);
            for (const f of clientUserForecast.forecasts) {
                const forecast = new Forecast();
                const party = await entityManager.getRepository(Party).findOne(f.id);

                if (!party) {
                    throw Error('Party with a given symbol, ' + f.id + ' ,could not be found!')
                }

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
                    throw Error('Party with a given symbol, ' + f.id + ' ,could not be found!')
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

app.get('/get-forecast', async (req: express.Request, res: express.Response) => {
    const clientGetForecast: IClientGetForecastInput = req.body;
    if (!clientGetForecast.email) {
        throw new Error('Email needs to be specified to retrieve forecast');
    }

    const clientUserForecast = await getRepository(UserForecast).findOne({ email: clientGetForecast.email });

    if (!clientGetForecast) {
        throw new Error('User with specified email does not exist!');
    }

    const forecasts = await getRepository(Forecast).find({
        userForecast: clientUserForecast,
        version: (clientUserForecast as any).latestVersion,
    });

    res.json({ message: 'ok', data: forecasts });
});

// app.post('/update-forecast', async (req: express.Request, res: express.Response) => {
//     const clientUpdateForecast: IClientForecastUpdateInput = req.body;

//     if (clientUpdateForecast.id === null || clientUpdateForecast.id === undefined) {
//         throw new Error('The id of forecast must be defined');
//     }

//     return await getManager().transaction(async entityManager => {
//         const userForecast = await entityManager.getRepository(UserForecast).findOneOrFail(clientUpdateForecast.id);
//         const newVersion = userForecast.latestVersion + 1;

//         for (const forecast of clientUpdateForecast.forecasts) {

//         }
//     });
// });

app.listen(port, "0.0.0.0");
