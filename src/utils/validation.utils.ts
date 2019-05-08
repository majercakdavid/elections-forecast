import {IClientForecastPartyInput} from "../interface/IClientForecast";

const partiesId = [ 'CPI',
    'PP',
    'LG',
    'PDF',
    'FDV',
    'M5S',
    'PPI',
    'SVP',
    'LS',
    'PAI',
    'PD',
    'FI',
    '+EU',
    'PPA',
    'APE',
    'FDI',
    'PC',
    'FN' ];
const regions = [
    'Abruzzo',
    'Basilicata',
    'Calabria',
    'Campania',
    'Emilia-Romagna',
    'Friuli-Venezia Giulia',
    'Lazio',
    'Liguria',
    'Lombardia',
    'Marche',
    'Molise',
    'Piemonte',
    'Puglia',
    'Sardegna',
    'Sicilia',
    'Toscana',
    'Trentino-Alto Adige',
    'Umbria',
    'Valle d\'Aosta',
    'Veneto',
    'Estero' ]

/**
 * Evaluate a new forecast
 * @param forecasts
 * @return boolean
 */
export function evaluateForecasts(forecasts: IClientForecastPartyInput[]): boolean {
    for (const forecast of forecasts) {
        if (forecast.percentage > 60) {
            return false;
        }
    }
    return true;
}

/**
 * Check if the sum of a forecast is 100
 * @param forecasts
 */
export function validateForecasts(forecasts: IClientForecastPartyInput[]): boolean {
    let forecastSum = 0;
    for (const f of forecasts) {
        if (f.percentage < 0 || f.percentage === null || f.percentage === undefined || !partiesId.includes(f.id)) {
            return false;
        }
        forecastSum = precisionRound(forecastSum, 4) + precisionRound(f.percentage, 4);
    }
    return forecastSum === 100;
}

/**
 * Validate correct email format
 * @param email
 */
export function validateEmail(email: string): boolean {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

/**
 * Validate region
 * @param region
 */
export function validateRegion(region: string): boolean {
    return regions.includes(region);
}

/**
 * Round a number according to a specific precision
 */
function precisionRound(numb: number, precision: number): number {
    const factor = Math.pow(10, precision);
    return Math.round(numb * factor) / factor;
}
