import { getRepository } from 'typeorm';

import UserForecast from '../entity/UserForecast';
import { WSEmailExistRequest, WSNicknameExistRequest, WSNicknameExistResponse } from '../interface/IWSMessage';

import WebSockets from 'ws';

const WebSocketServer = WebSockets.Server;
const wss = new WebSocketServer({ port: 31415 });

wss.on('connection', ws => {
    ws.on('message', async (message: any) => {
        const messageObj = JSON.parse(message);

        if (messageObj instanceof WSNicknameExistRequest) {
            const dbRes = await getRepository(UserForecast).find({ nickname: messageObj.nickname });

            if (dbRes.length > 0) {
                ws.send(new WSNicknameExistResponse(messageObj.requestId, true));
            } else {
                ws.send(new WSNicknameExistResponse(messageObj.requestId, false));
            }
        } else if (messageObj instanceof WSEmailExistRequest) {
            const dbRes = await getRepository(UserForecast).find({ email: messageObj.email });

            if (dbRes.length > 0) {
                ws.send(new WSNicknameExistResponse(messageObj.requestId, true));
            } else {
                ws.send(new WSNicknameExistResponse(messageObj.requestId, false));
            }
        } else {
            ws.send({ message: 'Wrong request', requestId: messageObj.requestId });
        }
    });
});
