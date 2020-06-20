//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

const _Scene_Map_updateCallMenu = Scene_Map.prototype.updateCallMenu;
Scene_Map.prototype.updateCallMenu = function() {
    _Scene_Map_updateCallMenu.call(this);
    if (this.isMenuEnabled()) {
        if (this.menuCalling && $gamePlayer.isMoving()) this.callMenu();
    }
};