export interface IClientForecastInput {
    forecasts: IClientForecastPartyInput[];
    email: string;
    nickname?: string;
    region?: string;
    id?: string;
}

export interface IClientForecastPartyInput {
    id: string;
    percentage: number;
}

export interface IClientGetForecastInput {
    id: string;
}
