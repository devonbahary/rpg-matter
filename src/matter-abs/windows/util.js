export function updateShow() {
    if (this.isOpen() && ($gameMap.isEventRunning() || $gameMessage.isBusy())) this.close();
    else if (this.isClosed() && !$gameMap.isEventRunning() && !$gameMessage.isBusy()) this.open();
};

export function drawGaugeABS(x, y, width, height, rate, color1, color2) {
    const fillW = Math.max(0, (width - 2) * rate);
    this.contents.fillRect(x, y, width, height, gaugeBorderColor.call(this));
    this.contents.fillRect(x + 1, y + 1, width - 2, height - 2, this.gaugeBackColor());
    this.contents.gradientFillRect(x + 1, y + 1, fillW, height - 2, color1, color2);
};

function gaugeBorderColor() {
    return this.textColor(15);
};