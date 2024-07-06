function roundNumber(number, price) {
    const getDecimalPlaces = (numero) => {
        const parts = numero.toString().split('.');
        return parts.length > 1 ? parts[1].length : 0;
    };

    const roundNumberInternal = (numero, minimamlDecimalPlaces) => {
        const multiplicationFactor = Math.pow(10, minimamlDecimalPlaces);
        const roundNumberCalc = (Math.round(numero * multiplicationFactor) / multiplicationFactor).toString();
        const parts = roundNumberCalc.split('.');

        // Adiciona zeros à direita, se necessário
        if (parts.length > 1) {
            parts[1] = parts[1].padEnd(minimamlDecimalPlaces, '0');
        } else if (minimamlDecimalPlaces > 0) {
            parts.push('0'.repeat(minimamlDecimalPlaces));
        }

        return parts.join('.');
    };

    const decimalPlaces = getDecimalPlaces(price);
    const priceRound = roundNumberInternal(number, decimalPlaces);

    return priceRound;
}

module.exports = {
    roundNumber
}