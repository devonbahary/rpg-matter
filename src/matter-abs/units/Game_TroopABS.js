//-----------------------------------------------------------------------------
// DataManager
//
// The static class that manages the database and game objects.

const _DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
    _DataManager_createGameObjects.call(this);
    $gameTroop         = new Game_TroopABS(); // overwrite
};

//-----------------------------------------------------------------------------
// Game_TroopABS
//
// The game object class for a troop and the battle-related data.

function Game_TroopABS() {
    this.initialize.apply(this, arguments);
}

Game_TroopABS.prototype = Object.create(Game_Unit.prototype);
Game_TroopABS.prototype.constructor = Game_TroopABS;

Game_TroopABS.prototype.initialize = function() {
    Game_Unit.prototype.initialize.call(this);
    this.clear();
};

Game_TroopABS.prototype.members = function() {
    return this._enemies;
};

Game_TroopABS.prototype.clear = function() {
    this._idToBattlerMap = {};
    this._enemies = [];
};

Game_TroopABS.prototype.addEnemy = function(battler) {
    this.addBattler(battler);
    this._enemies.push(battler);
};

Game_TroopABS.prototype.removeEnemy = function(battler) {
    this.removeBattler(battler);
    this._enemies = this._enemies.filter(e => e.id !== battler.id);
};