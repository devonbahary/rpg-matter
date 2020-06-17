import MATTER_CORE from "./pluginParams";


Number.prototype.round = function() {
    return Math.round(this * 1000) / 1000;
};

Number.prototype.isInRange = function(min, max) {
    return min <= this && this <= max;
};

//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the keyboard and gamepads.
 *
 * @class Input
 */

Input.keyMapper = {
    ...Input.keyMapper,
    9: 'tab',       // tab
    65: 'A',        // A
    67: 'C',        // C
    68: 'D',        // D
    69: 'E',        // E
    81: 'Q',        // Q
    82: 'R',        // R
    83: 'S',        // S
    86: 'V',        // V
    87: 'W',        // W
    88: 'X',        // X
    90: 'Z',        // Z
};

Input.isPlaytestTimescalePressed = function() {
    if (!$gameTemp.isPlaytest() || !MATTER_CORE.PLAYTEST_IS_TIMESCALE_ADJUST) return false;
    const mappedKey = Input.keyMapper[MATTER_CORE.PLAYTEST_TIMESCALE_KEY_CODE];
    return Input.isPressed(mappedKey);
};

const _Input_clear = Input.clear;
Input.clear = function() {
    _Input_clear.call(this);
    this._keyPressTimestamps = {};
};

const _Input_update = Input.update;
Input.update = function() {
    _Input_update.call(this);
    this.updateDoubleTap();
};

Input.DOUBLE_TAP_THRESHOLD_MIN = 50;
Input.DOUBLE_TAP_THRESHOLD_MAX = 250;

Input.updateDoubleTap = function() {
    if (!this._latestButton || this._pressedTime !== 0) return;

    const lastButtonTimestamp = this._keyPressTimestamps[this._latestButton];
    if (!lastButtonTimestamp || (Date.now() - lastButtonTimestamp >= Input.DOUBLE_TAP_THRESHOLD_MAX)) {
        this._keyPressTimestamps[this._latestButton] = Date.now();
    }
};

Input.isDoubleTapped = function(keyName) {
    if (!this.isTriggered(keyName)) return false;
    
    const timeDiff = Date.now() - this._keyPressTimestamps[keyName];
    return timeDiff > Input.DOUBLE_TAP_THRESHOLD_MIN && timeDiff < Input.DOUBLE_TAP_THRESHOLD_MAX;
};

window.addEventListener('keydown', event => {
    if (event.key === 'Tab') event.preventDefault();
});