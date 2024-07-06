const axios = require('axios');

// Função para obter velas
async function getKlines(symbol, interval, limit, startTime) {
    const url = 'https://fapi.binance.com/fapi/v1/klines';

    // Construa os parâmetros da consulta
    const params = {
        symbol: symbol,
        interval: interval,
        limit: limit,
        startTime: startTime,
    };

    try {
        const response = await axios.get(url, { params });

        const klines = response.data.map(candle => ({
            time: new Date(candle[0]),
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5]),
        }));

        return klines;
    } catch (error) {
        console.error('Erro na chamada da API:', error.message);
        throw error;
    }
}

// Função para obter todas as velas
async function getAllKlines(symbol, interval, limit, totalLimit) {
    let startTime = 0;
    let allKlines = [];

    try {
        while (allKlines.length < totalLimit) {
            const klines = await getKlines(symbol, interval, limit, startTime);

            if (klines.length === 0) {
                break; // Sai do loop se não houver mais velas
            }

            allKlines = allKlines.concat(klines);
            startTime = klines[klines.length - 1][0] + 1;
        }

        // Retorna todas as velas acumuladas
        return allKlines.slice(0, totalLimit);
    } catch (error) {
        console.error('Erro ao obter todas as velas:', error.message);
        throw error;
    }
}


// Exemplo de uso
async function getHistoryCandles30DaysFutures(symbol, interval) {
    const limit = 1500; // Número máximo de velas por chamada
    let startTime = 0; // Substitua pelo timestamp da última vela obtida

    try {
        // Loop para obter 8640 velas
        for (let i = 0; i < 6; i++) {
            const klines = await getKlinesFutures(symbol, interval, limit, startTime);
            console.log("klines: ", klines);

            // Processar as velas (faça algo com elas)

            // Atualizar o startTime para o timestamp da última vela obtida
            startTime = klines[klines.length - 1][0] + 1;
        }

        return klines;
    } catch (error) {
        // Lidar com erros
    }
}

// Função para obter velas
async function getKlinesFutures(symbol, interval, limit, startTime) {
    const url = 'https://fapi.binance.com/fapi/v1/klines';

    // Construa os parâmetros da consulta
    const params = {
        symbol: symbol,
        interval: interval,
        limit: limit,
        startTime: startTime,
    };

    try {
        const response = await axios.get(url, { params });

        // Processar a resposta da API
        const klines = response.data;
        // Faça algo com as velas (klines) aqui

        return klines;
    } catch (error) {
        console.error('Erro na chamada da API:', error.message);
        throw error;
    }
}

const getHistoryCandlesFutures = async (symbol, interval) => {
    // Configuração da solicitação
    const requestOptions = {
        method: 'get',
        url: `https://fapi.binance.com/fapi/v1/klines`,
        params: {
            symbol: symbol,
            interval: interval,
            limit: 239,
        },
        // headers: {
        //     'X-MBX-APIKEY': 'SuaChaveDeAPIAqui', // Substitua pelo seu próprio X-MBX-APIKEY
        // },
    };

    // Faz a solicitação à API REST
    try {
        const response = await axios(requestOptions);
        // console.log("response.data [CANDLES]: ", response.data); // DEBUG

        const candles = response.data.map(candle => ({
            time: new Date(candle[0]),
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5]),
            trades: parseFloat(candle[8])
        }));

        // candles.sort((a, b) => b.close - a.close);

        return candles;
    } catch (error) {
        console.error('Erro na solicitação:', error.message || error);
    }

    return false;
}

const getTopVolumePairs = async () => {
    try {
        const response = await axios.get('https://api.binance.com/api/v3/ticker/24hr');
        const pairs = response.data
            .filter(pair => pair.symbol.endsWith('USDT')) // Filtrar apenas pares em relação ao USDT
            .map(pair => ({
                symbol: pair.symbol,
                volume: parseFloat(pair.volume),
            }))
            .sort((a, b) => b.volume - a.volume) // Ordenar por volume decrescente
            .slice(0, 20); // Obter os top 20 pares com maior volume

        return pairs;
    } catch (error) {
        console.error('Error fetching top volume pairs:', error.message || error);
        return [];
    }
}

const getHistoryCandlesSpot = async (symbol, interval) => {
    // Configuração da solicitação
    const requestOptions = {
        method: 'get',
        url: `https://api.binance.com/api/v3/klines`,
        params: {
            symbol: symbol,
            interval: interval,
            limit: 239,
        },
    };

    // Faz a solicitação à API REST
    try {
        const response = await axios(requestOptions)
        const candles = response.data.map(candle => ({
            time: new Date(candle[0]),
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5]),
        }));

        // DEBUG
        // console.log("response.data: ", response.data.slice(-1));
        // console.log("CANDLES: ", candles.slice(-1));

        return candles;
    } catch (error) {
        console.error(`Error [getHistoryCandlesSpot][${symbol}]:`, error.message || error);
    }

    return false;
}

async function getTopVolumePairs24h() {
    try {
        const baseUrl = 'https://fapi.binance.com'; // URL da Binance Futures API

        // Obter todos os pares disponíveis
        const response = await axios.get(`${baseUrl}/fapi/v1/exchangeInfo`);
        const allPairs = response.data.symbols;

        // Filtrar pares com base em critérios específicos (por exemplo, volume, popularidade) e que terminam com "USDT"
        const filteredPairs = allPairs.filter(pair => {
            return pair.status === 'TRADING' && pair.symbol.endsWith('USDT');
        });

        // Classificar os pares com base no volume em ordem decrescente
        filteredPairs.sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume));

        // Obter apenas os símbolos dos 20 primeiros pares filtrados
        // const symbols = filteredPairs.slice(0, 20);
        const symbols = filteredPairs.slice(0, 20);

        return symbols;
    } catch (error) {
        console.error('Erro ao obter os pares com maior volume:', error);
        throw error;
    }
}

async function getTopChangePairs() {
    const apiUrl = 'https://fapi.binance.com/fapi/v1/ticker/24hr';

    try {
        // Faça uma solicitação GET para a API de Futuros da Binance usando axios
        const response = await axios.get(apiUrl);

        // Verifique se a solicitação foi bem-sucedida (código de resposta 200)
        if (response.status === 200) {
            // Obtenha os dados JSON da resposta
            const tickers = response.data;

            const filteredTickers = tickers.filter(ticker => {
                return ticker.symbol.endsWith('USDT') && parseFloat(ticker.priceChangePercent) > process.env.MIN_PERCENT_CHANGE;
            });
            const sortedTickers = filteredTickers.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent));

            // console.log("sortedTickers: ", sortedTickers); // DEBUG

            return sortedTickers;
        } else {
            // Imprima uma mensagem de erro se a solicitação não for bem-sucedida
            console.error(`Erro na solicitação: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Erro na solicitação: ${error.message}`);
        return null;
    }
}

async function getTopHighPairs() {
    const apiUrl = 'https://fapi.binance.com/fapi/v1/ticker/24hr';

    try {
        // Faça uma solicitação GET para a API de Futuros da Binance usando axios
        const response = await axios.get(apiUrl);

        // Verifique se a solicitação foi bem-sucedida (código de resposta 200)
        if (response.status === 200) {
            // Obtenha os dados JSON da resposta
            const tickers = response.data;

            const filteredTickers = tickers.filter(ticker => {
                return ticker.symbol.endsWith('USDT') && parseFloat(ticker.highPrice) > process.env.MIN_HIGH_PRICE;
            });
            const sortedTickers = filteredTickers.sort((a, b) => parseFloat(b.highPrice) - parseFloat(a.highPrice));

            // console.log("sortedTickers: ", sortedTickers); // DEBUG

            return sortedTickers;
        } else {
            // Imprima uma mensagem de erro se a solicitação não for bem-sucedida
            console.error(`Erro na solicitação: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Erro na solicitação: ${error.message}`);
        return null;
    }
}

async function getTopLowPairs() {
    const apiUrl = 'https://fapi.binance.com/fapi/v1/ticker/24hr';

    try {
        // Faça uma solicitação GET para a API de Futuros da Binance usando axios
        const response = await axios.get(apiUrl);

        // Verifique se a solicitação foi bem-sucedida (código de resposta 200)
        if (response.status === 200) {
            // Obtenha os dados JSON da resposta
            const tickers = response.data;

            const filteredTickers = tickers.filter(ticker => {
                return ticker.symbol.endsWith('USDT')
            });

            let sortedTickers = filteredTickers.sort((a, b) => parseFloat(a.lowPrice) - parseFloat(b.lowPrice));

            // console.log("sortedTickers: ", sortedTickers); // DEBUG

            return sortedTickers;
        } else {
            // Imprima uma mensagem de erro se a solicitação não for bem-sucedida
            console.error(`Erro na solicitação: ${response.status}`);
            return null;
        }
    } catch (error) {
        console.error(`Erro na solicitação: ${error.message}`);
        return null;
    }
}

module.exports = {
    getHistoryCandlesSpot,
    getTopVolumePairs,
    getTopVolumePairs24h,
    getHistoryCandlesFutures,
    getHistoryCandles30DaysFutures,
    getAllKlines,
    getTopChangePairs,
    getTopLowPairs,
    getTopHighPairs
}