//-----------------------------------------------------------------------------
// Game_Screen
//
// The game object class for screen effect data, such as changes in color tone
// and flashes.

const _Game_Screen_clear = Game_Screen.prototype.clear;
Game_Screen.prototype.clear = function() {
    _Game_Screen_clear.call(this);
    this.clearPlayerSelectionTint();
};

Game_Screen.prototype.clearPlayerSelectionTint = function() {
    this._prePlayerSelectionToneTarget = null;
};

Game_Screen.prototype.startPlayerSelectionTint = function() {
    this._prePlayerSelectionToneTarget = this._toneTarget.clone();
    this.startTint([ 0, 0, 0, 200 ], 0);
};

Game_Screen.prototype.endPlayerSelectionTint = function() {
    if (this._prePlayerSelectionToneTarget) this.startTint(this._prePlayerSelectionToneTarget, 0);
    this.clearPlayerSelectionTint();
};

