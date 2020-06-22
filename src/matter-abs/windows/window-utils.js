export function updateShow() {
    if (this.isOpen() && (this.shouldHide ? this.shouldHide() : shouldHide())) this.close();
    else if (this.isClosed() && (this.shouldShow ? this.shouldShow() : shouldShow())) this.open();
};

export function shouldShow() {
    return !$gameMap.isEventRunning() && !$gameMessage.isBusy();
};

export function shouldHide() {
    return $gameMap.isEventRunning() || $gameMessage.isBusy();
};

export function drawGaugeABS(x, y, width, height, rate, color1, color2, gradientOpacity = 255) {
    const fillW = Math.max(0, (width - 2) * rate);
    this.contents.fillRect(x, y, width, height, gaugeBorderColor.call(this));
    this.contents.fillRect(x + 1, y + 1, width - 2, height - 2, this.gaugeBackColor());
    this.contents.paintOpacity = gradientOpacity;
    this.contents.gradientFillRect(x + 1, y + 1, fillW, height - 2, color1, color2);
    this.contents.paintOpacity = 255;
};

function gaugeBorderColor() {
    return this.textColor(15);
};