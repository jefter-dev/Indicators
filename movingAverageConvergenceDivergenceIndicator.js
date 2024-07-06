function calculateEMA(previousEMA, currentValue, period) {
    const multiplier = 2 / (period + 1);
    return (currentValue - previousEMA) * multiplier + previousEMA;
}

function calculateMACD(candles, shortPeriod, longPeriod, signalPeriod) {
    let emaShort = candles[0].close;
    let emaLong = candles[0].close;
    let macdLine = 0;
    let signalLine = 0;
    let histogram = 0;

    for (let i = 0; i < candles.length; i++) {
        const closePrice = candles[i].close;

        // Calcular as médias móveis exponenciais
        emaShort = calculateEMA(emaShort, closePrice, shortPeriod);
        emaLong = calculateEMA(emaLong, closePrice, longPeriod);

        // Calcular a linha MACD
        macdLine = emaShort - emaLong;

        // Calcular a linha de sinal
        signalLine = calculateEMA(signalLine, macdLine, signalPeriod);

        // Adicionar os valores ao objeto do candle
        candles[i].macdLine = macdLine;
    }

    // Retornar apenas os últimos 10 candles
    return candles;
}

module.exports = {
    calculateMACD,
}
