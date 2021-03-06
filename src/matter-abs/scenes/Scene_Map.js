//-----------------------------------------------------------------------------
// Scene_Map
//
// The scene class of the map screen.

import MATTER_ABS from "../MatterActionBattleSystem";

const _Scene_Map_createAllWindows = Scene_Map.prototype.createAllWindows;
Scene_Map.prototype.createAllWindows = function() {
    _Scene_Map_createAllWindows.call(this);
    this.createTargetWindow();
    this.createPlayerBattlerWindow();
    this.createActionHUDWindow();
    this.createGoldWindow();
    this.createLogsWindow();
};

Scene_Map.prototype.createTargetWindow = function() {
    this._targetWindow = new Window_Target();
    this.addChild(this._targetWindow);
};

Scene_Map.prototype.createPlayerBattlerWindow = function() {
    this._playerBattlerWindow = new Window_PlayerBattler();
    this.addChild(this._playerBattlerWindow);
};

Scene_Map.prototype.createActionHUDWindow = function() {
    this._actionHUDWindow = new Window_Action_HUD();
    this.addChild(this._actionHUDWindow);
};

Scene_Map.prototype.createGoldWindow = function() {
    this._goldWindow = new Window_GoldABS();
    this.addChild(this._goldWindow);
};

Scene_Map.prototype.createLogsWindow = function() {
    this._mapLogsWindow = new Window_MapLogs(this._goldWindow);
    this.addChild(this._mapLogsWindow);
};

const _Scene_Map_isMenuEnabled = Scene_Map.prototype.isMenuEnabled;
Scene_Map.prototype.isMenuEnabled = function() {
    const shouldRestrictDueToBattle = !MATTER_ABS.ALLOW_MENU_DURING_BATTLE && $gameParty.isInBattle;
    const shouldRestrictDueToAction = !MATTER_ABS.ALLOW_MENU_DURING_BATTLE && $gameParty.isInAction;
    return (
        _Scene_Map_isMenuEnabled.call(this) && 
        !shouldRestrictDueToBattle && 
        !shouldRestrictDueToAction &&
        !$gameMap.isSelectionMode
    );
};