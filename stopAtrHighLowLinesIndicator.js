// Stop ATR - High Low Lines

const { roundNumber } = require("./utils");

// Função para calcular o Average True Range (ATR)
function atr(high, low, close, length) {
    let trueRanges = [];

    for (let i = 1; i < high.length; i++) {
        let trueRange = null;

        // Calculate true range
        if (i === 1 || isNaN(high[i - 1])) {
            trueRange = high[i] - low[i];
        } else {
            trueRange = Math.max(
                high[i] - low[i],
                Math.abs(high[i] - close[i - 1]),
                Math.abs(low[i] - close[i - 1])
            );
        }

        trueRanges.push(trueRange);
    }

    // Calculate the Running Moving Average (RMA) of true ranges
    let sum = 0;
    for (let i = 0; i < length; i++) {
        sum += trueRanges[i];
    }
    let rmaValue = sum / length;

    for (let j = length; j < trueRanges.length; j++) {
        rmaValue = (trueRanges[j] + (length - 1) * rmaValue) / length;
    }

    return rmaValue;
}

// Função para calcular o trailing stop
function calculateTrail(inputData, AP2, AF2) {
    let Trail2 = [];
    let prevTrail2 = 0;

    for (let i = 0; i < inputData.length; i++) {
        let SC = inputData[i].close;

        // Verificar se o índice anterior é válido
        let prevClose = i > 0 ? inputData[i - 1].close : null;

        let SL2 = AF2 * atr(
            inputData.slice(0, i + 1).map(item => item.high),
            inputData.slice(0, i + 1).map(item => item.low),
            inputData.slice(0, i + 1).map(item => item.close),
            AP2
        );

        // Verificar se o índice anterior é válido
        if (prevClose !== null) {
            if (SC > prevTrail2 && prevClose > prevTrail2) {
                Trail2.push(Math.max(prevTrail2, SC - SL2));
            } else if (SC < prevTrail2 && prevClose < prevTrail2) {
                Trail2.push(Math.min(prevTrail2, SC + SL2));
            } else if (SC > prevTrail2) {
                Trail2.push(SC - SL2);
            } else {
                Trail2.push(SC + SL2);
            }
        } else {
            // Se o índice anterior não for válido, não é possível determinar a direção da vela
            // Então, adicionaremos o valor do SC diretamente ao Trail2
            Trail2.push(SC);
        }

        prevTrail2 = Trail2[i];
    }

    return Trail2;
}

const calculateStopAtr = async (candles, AP2, AF2) => {
    const Trail2 = calculateTrail(candles, AP2, AF2);

    // Determine the color for each candle
    for (let i = 0; i < candles.length; i++) {
        const signal = roundNumber(Trail2[i], candles[i].close);
        const signalColor = candles[i].close > Trail2[i] ? "green" : "red";
        const signalBuy = candles[i].close > Trail2[i] ? true : false;

        candles[i].trailAtr = Trail2[i];
        candles[i].signalAtr = signal;
        candles[i].signalColorAtr = signalColor;
        candles[i].signalBuyAtr = signalBuy;
    }

    return candles;
}

module.exports = {
    calculateStopAtr,
}