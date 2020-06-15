//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    this.createPlayerBattlerWindow();
};

Scene_Map.prototype.createPlayerBattlerWindow = function() {
    this._playerBattlerWindow = new Window_PlayerBattler();
    this.addChild(this._playerBattlerWindow);
};