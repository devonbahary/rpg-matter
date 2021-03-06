//-----------------------------------------------------------------------------
// Game_Unit
//
// The superclass of Game_Party and Game_Troop.

const _Game_Unit_initialize = Game_Unit.prototype.initialize;
Game_Unit.prototype.initialize = function() {
    _Game_Unit_initialize.call(this);
    this._idToBattlerMap = {};
};

Game_Unit.prototype.battlerById = function(battlerId) {
    return this._idToBattlerMap[battlerId];
};

Game_Unit.prototype.update = function() {
    this.members().forEach(battler => battler.update());
};

Game_Unit.prototype.addBattler = function(battler) {
    this._idToBattlerMap[battler.id] = battler;
};

Game_Unit.prototype.removeBattler = function(battler) {
    delete this._idToBattlerMap[battler.id];
};

Game_Unit.prototype.opponentsUnit = function() {
};

Game_Unit.prototype.hasAggro = function() {
    return this.opponentsUnit().members().some(m => m.hasAggro());
};