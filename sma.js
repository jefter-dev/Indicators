const { roundNumber } = require("./utils");

// Função para calcular a média móvel simples (SMA)
function calculateSMA(data, period) {
    let smaArray = [];
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
        sum += data[i].close;
        if (i >= period - 1) {
            smaArray.push(sum / period);
            sum -= data[i - period + 1].close;
        } else {
            smaArray.push(null);
        }
    }
    return smaArray;
}

// Função principal para processar os dados e calcular as médias móveis e os sinais
function calculateSMAPeriods(data, shortPeriod, longPeriod, longPeriod200 = 200) {
    const shortMA = calculateSMA(data, shortPeriod);
    const longMA = calculateSMA(data, longPeriod);
    const longMA200 = calculateSMA(data, longPeriod200);

    // Adicionando as médias móveis aos dados de entrada
    for (let i = 0; i < data.length; i++) {
        data[i].smaShort = parseFloat(roundNumber(shortMA[i], data[i].close));
        data[i].smaLong = parseFloat(roundNumber(longMA[i], data[i].close));
        data[i].smaLong200 = parseFloat(roundNumber(longMA200[i], data[i].close));

        // Verificar os sinais de compra e venda
        if (i > 0) {
            const longRatio = longMA200[i] / longMA[i];
            const buyCondition = shortMA[i] > longMA[i] && longRatio <= 0.98;
            const sellCondition = shortMA[i] < longMA[i] && longRatio >= 1.03;

            data[i].signalBuySma = buyCondition && shortMA[i - 1] <= longMA[i - 1];
            // data[i].signalSellSma = sellCondition && shortMA[i - 1] >= longMA[i - 1];
        } else {
            data[i].signalBuySma = false;
            // data[i].signalSellSma = false;
        }
    }

    return data;
}

module.exports = {
    calculateSMAPeriods,
}
