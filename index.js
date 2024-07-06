const { getHistoryCandlesFutures } = require("./dataBinance");
const { calculateMACD } = require("./movingAverageConvergenceDivergenceIndicator");
const { calculateRSI } = require("./relativeStrengthIndex");
const { calculateSMAPeriods } = require("./sma");
const { calculateSqueezeMomentum } = require("./squeezeMomentumIndicator");
const { calculateStopAtr } = require("./stopAtrHighLowLinesIndicator");

const execute = async () => {
    const symbol = "BTCUSDT";
    const interval = "5m";
    const candles = await getHistoryCandlesFutures(symbol, interval);
    // console.log("[CANDLES]: ", candles.slice(candles.length - 10, candles.length - 1));

    const lengthKC = 20; // Squeeze Period
    const AP2 = 10; // ATR Period
    const AF2 = 2; // ATR Factor

    const shortPeriod = 21;
    const longPeriod = 50;

    let candlesResult = [];
    candlesResult = await calculateSqueezeMomentum(candles, lengthKC);
    candlesResult = await calculateStopAtr(candles, AP2, AF2);
    candlesResult = await calculateMACD(candlesResult, shortPeriod, longPeriod);
    candlesResult = await calculateSMAPeriods(candlesResult, shortPeriod, longPeriod);
    candlesResult = await calculateSMAPeriods(candles);
    candlesResult = await calculateRSI(candlesResult, 25);
    candlesResult = await calculateRSI(candlesResult, 100, "long");

    console.log("RESULT [CANDLES]: ", candlesResult.slice(candlesResult.length - 5, candlesResult.length - 1));

    return candles;
}

execute();
