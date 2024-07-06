// Squeeze Momentum Indicator

const { roundNumber } = require("./utils");

function avg(...args) {
    const sum = args.reduce((acc, value) => acc + value, 0);
    return sum / args.length;
}

function highest(arr, n) {
    return arr.slice(-n).reduce((max, value) => Math.max(max, value), -Infinity);
}

function lowest(arr, n) {
    return arr.slice(-n).reduce((min, value) => Math.min(min, value), Infinity);
}

function sma(arr, length) {
    const slice = arr.slice(-length);
    const sum = slice.reduce((acc, value) => acc + value, 0);
    return sum / length;
}

function linreg(source, length, offset) {
    const n = length;
    const sumX = n * (n - 1) / 2;
    const sumY = source.reduce((acc, value) => acc + value, 0);
    const sumXY = source.reduce((acc, value, i) => acc + i * value, 0);
    const sumX2 = n * (n - 1) * (2 * n - 1) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return intercept + slope * (length - 1 - offset);
}

function calculateSqueezeMomentum(candles, lengthKC) {
    const resultCalc = [];

    for (let i = lengthKC - 1; i < candles.length; i++) {
        const currentCandle = candles[i];
        const { time, open, high, low, close, volume } = currentCandle;

        const candleSlice = candles.slice(i - lengthKC + 1, i + 1);
        const highKC = highest(candleSlice.map(c => c.high), lengthKC);
        const lowKC = lowest(candleSlice.map(c => c.low), lengthKC);

        const smaClose = sma(candleSlice.map(c => c.close), lengthKC);
        const avg1 = avg(highKC, lowKC);
        const calc = avg(avg1, smaClose);
        // const calc = parseFloat(Number(avgHighLowSma).toFixed(2));

        resultCalc.push({
            time,
            open,
            high,
            low,
            close,
            volume,
            calc,
        });
    }

    const finalResult = [];

    for (let index = 0; index < resultCalc.length; index++) {
        const currentCandle = resultCalc[index];
        const { time, open, high, low, close, volume, calc } = currentCandle;

        const candleSlice = resultCalc.slice(index - lengthKC + 1, index + 1);
        // const source = candleSlice.map((c) => parseFloat(Number(c.close - c.calc).toFixed(2)));
        const source = candleSlice.map((c) => c.close - c.calc);
        // const val = parseFloat(Number(linreg(source, lengthKC, 0).toFixed(2)));
        const val = linreg(source, lengthKC, 0);

        const prevVal = finalResult.length > 0 ? finalResult[finalResult.length - 1].val : 0;

        const signalColor =
            val > 0 ? (val > prevVal ? 'lime' : 'green') : val < prevVal ? 'red' : 'maroon';
        // const signalBuy = val > 0 ? (val > prevVal ? true : false) : false;
        const signalBuy = val > 0 ? true : false;

        // console.log("val: ", val, prevVal); // DEBUG

        // const signal = parseFloat(Number(val).toFixed(8));
        const signal = roundNumber(val, close);

        finalResult.push({
            // time, open, high, low, close, volume,
            ...currentCandle,
            val,
            calcSqueeze: calc,
            valSqueeze: val,
            signalSqueeze: signal,
            signalColorSqueeze: signalColor,
            signalBuySqueeze: signalBuy
        });
    }

    return finalResult;
}

module.exports = {
    calculateSqueezeMomentum,
}