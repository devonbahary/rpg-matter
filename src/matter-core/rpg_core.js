import MATTER_CORE from "./pluginParams";


Number.prototype.round = function() {
    return Math.round(this * 1000) / 1000;
};

//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the keyboard and gamepads.
 *
 * @class Input
 */


Input.isPlaytestTimescalePressed = function() {
    if (!$gameTemp.isPlaytest() || !MATTER_CORE.PLAYTEST_IS_TIMESCALE_ADJUST) return false;
    const mappedKey = Input.keyMapper[MATTER_CORE.PLAYTEST_TIMESCALE_KEY_CODE];
    return Input.isPressed(mappedKey);
};