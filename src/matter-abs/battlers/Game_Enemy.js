//-----------------------------------------------------------------------------
// Game_Enemy
//
// The game object class for an enemy.

import { getMassFromMeta } from "../../utils";

Object.defineProperties(Game_Enemy.prototype, {
    imageName: { get: function() { return this.enemy().meta.characterName; }, configurable: false },
    imageIndex: { get: function() { return parseInt(this.enemy().meta.characterIndex); }, configurable: false },
    mass: { get: function() { 
        const enemyMass = getMassFromMeta(this.enemy().meta.mass);
        if (enemyMass) return enemyMass;
        return Game_Battler.prototype.mass;
    }, configurable: false },
});

Game_Enemy.prototype.isFriendWith = function(battler) {
    return battler.isEnemy();
};

Game_Enemy.prototype.isEnemyWith = function(battler) {
    return battler.isActor();
};

Game_Enemy.prototype.die = function() {
    Game_Battler.prototype.die.call(this);
    this.performCollapse();
};

Game_Enemy.prototype.isEventErasable = function() {
    return this._effectTypeFulfilled;
};