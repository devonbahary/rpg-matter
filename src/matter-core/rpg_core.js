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