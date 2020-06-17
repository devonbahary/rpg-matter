//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

import MATTER_ABS from "../MatterActionBattleSystem";

const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    this.createPlayerBattlerWindow();
    this.createActionHUDWindow();
};

Scene_Map.prototype.createPlayerBattlerWindow = function() {
    this._playerBattlerWindow = new Window_PlayerBattler();
    this.addChild(this._playerBattlerWindow);
};

Scene_Map.prototype.createActionHUDWindow = function() {
    this._actionHUDWindow = new Window_Action_HUD();
    this.addChild(this._actionHUDWindow);
};

const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
Scene_Map.prototype.isMenuEnabled = function() {
    const shouldRestrictDueToBattle = !MATTER_ABS.ALLOW_MENU_DURING_BATTLE && $gameParty.isInBattle;
    return _Scene_Map_isMenuEnabled.call(this) && !shouldRestrictDueToBattle;
};