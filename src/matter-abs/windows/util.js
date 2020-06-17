export function updateShow() {
    if (this.isOpen() && ($gameMap.isEventRunning() || $gameMessage.isBusy())) this.close();
    else if (this.isClosed() && !$gameMap.isEventRunning() && !$gameMessage.isBusy()) this.open();
};