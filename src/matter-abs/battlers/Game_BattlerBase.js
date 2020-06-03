//-----------------------------------------------------------------------------
// Game_BattlerBase
//
// The superclass of Game_Battler. It mainly contains parameters calculation.

import { v4 as uuidv4 } from "uuid";

Object.defineProperties(Game_BattlerBase.prototype, {
    // AGgro Rate
    agr: { get: function() { return 1; }, configurable: false },
    weapon: { get: function() { return null; }, configurable: false },
});

const _Game_BattlerBase_initMembers = Game_BattlerBase.prototype.initMembers;
Game_BattlerBase.prototype.initMembers = function() {
    _Game_BattlerBase_initMembers.call(this);
    this.id = uuidv4();
    this.resetAggro();
    this._hitStun = 0;
};

Game_BattlerBase.prototype.isOccasionOk = function(item) {
    return item.occasion < 3; // not "never"
};

Game_BattlerBase.prototype.update = function() {
    this.updateHitStun();
    this.onTurnEnd()
};

Game_BattlerBase.prototype.updateHitStun = function() {
    if (this._hitStun) this._hitStun--;
}

Game_BattlerBase.prototype.applyHitStun = function(value) {
    // can't be stunned and result in being stunned for less than an already active stun
    if (value > this._hitStun) this._hitStun = value; 
};

Game_BattlerBase.prototype.isHitStunned = function() { 
    return this._hitStun;
};

Game_BattlerBase.prototype.resetAggro = function() {
    this._aggro = {};
};

Game_BattlerBase.prototype.gainAggro = function(battler, value) {
    if (this.isFriendWith(battler)) return;
    const val = battler.agr * value;
    if (!this._aggro[battler.id]) this._aggro[battler.id] = val;
    this._aggro[battler.id] += val;
};

Game_BattlerBase.prototype.clearBattlerAggro = function(battler) {
    delete this._aggro[battler.id];
};

Game_BattlerBase.prototype.topAggroBattler = function() {
    const topAggroBattlerId = Object.entries(this._aggro).reduce((topAggroBattlerId, [ battlerId, aggro ]) => {
        if (!topAggroBattlerId || !topAggroBaggro > this._aggro[topAggroBattlerId]) return battlerId;
        return topAggroBattlerId;
    }, null);
    return this.opponentsUnit().battlerById(topAggroBattlerId);
};

Game_BattlerBase.prototype.isFriendWith = function(battler) {
    return false;
};

Game_BattlerBase.prototype.isEnemyWith = function(battler) {
    return false;
};

const _Game_BattlerBase_die = Game_BattlerBase.prototype.die;
Game_BattlerBase.prototype.die = function() {
    _Game_BattlerBase_die.call(this);
    this._hitStun = 0;
    this.opponentsUnit().members().forEach(battler => {
        battler.clearBattlerAggro(this);
    });
};