// Função para calcular a Média Móvel Corrente (RMA)
function calculateRMA(values, length) {
    const rma = [];
    let sum = 0;

    for (let i = 0; i < values.length; i++) {
        if (i < length) {
            sum += values[i];
            rma.push(sum / (i + 1));
        } else {
            const alpha = 1 / length;
            sum = alpha * values[i] + (1 - alpha) * rma[rma.length - 1];
            rma.push(sum);
        }
    }

    return rma;
}

// Função para calcular as mudanças nos preços de fechamento - corrigida
function calculateChanges(prices) {
    const changes = [];
    for (let i = 0; i < prices.length; i++) {
        if (i === 0) {
            // Para o primeiro preço, a mudança é 0
            changes.push(0);
        } else {
            const change = prices[i] - prices[i - 1];
            changes.push(change);
        }
    }
    return changes;
}

// Função para calcular o RSI
async function calculateRSI(candles, rsiLength, period = "short") {
    const closes = candles.map(candle => candle.close);
    const changes = calculateChanges(closes);

    const up = calculateRMA(changes.map(change => Math.max(change, 0)), rsiLength);
    const down = calculateRMA(changes.map(change => -Math.min(change, 0)), rsiLength);

    const rsi = down.map((downValue, index) => {
        const upValue = up[index];
        return downValue === 0 ? 100 : (upValue === 0 ? 0 : 100 - (100 / (1 + upValue / downValue)));
    });

    for (let index = 0; index < Math.min(rsi.length, candles.length); index++) {
        if(period == "short") {
            candles[index].rsi = parseFloat(rsi[index]).toFixed(2);
            // candles[index].up = up[index];
            // candles[index].down = down[index];
        } else {
            candles[index].rsi_long = parseFloat(rsi[index]).toFixed(2);
            // candles[index].up_long = up[index];
            // candles[index].down_long = down[index];
        }
    }

    return candles;
}

module.exports = {
    calculateRSI,
}
