export interface IClientForecastInput {
    forecasts: IClientForecastPartyInput[];
    email: string;
    nickname: string;
    region: string;
}

export interface IClientUpdateForecastInput {
    forecasts: IClientForecastPartyInput[];
    id: string;
}

export interface IClientForecastPartyInput {
    id: string;
    percentage: number;
}

export interface IClientGetForecastInput {
    nickname: string;
}
