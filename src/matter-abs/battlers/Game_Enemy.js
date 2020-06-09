//-----------------------------------------------------------------------------
// Game_Enemy
//
// The game object class for an enemy.

import MATTER_ABS from "../MatterActionBattleSystem";

Object.defineProperties(Game_Enemy.prototype, {
    data: { get: function() { return this.enemy(); }, configurable: false },
    imageName: { get: function() { return this.data.meta.characterName; }, configurable: false },
    imageIndex: { get: function() { return parseInt(this.data.meta.characterIndex); }, configurable: false },
    moveSpeed: { get: function() { return Number(this.data.meta.moveSpeed); }, configurable: false },
    weaponIconIndex: { get: function() { return parseInt(this.data.meta.weaponIconIndex); }, configurable: false },
});

Game_Enemy.prototype.hitStunResist = function() {
    const hitStunResist = parseInt(this.data.meta.hitStunResist);
    if (isNaN(hitStunResist)) return Game_Battler.prototype.hitStunResist.call(this) + MATTER_ABS.DEFAULT_ENEMY_HIT_STUN_RESIST;
    return Game_Battler.prototype.hitStunResist.call(this) + hitStunResist;
};

Game_Enemy.prototype.isFriendWith = function(battler) {
    return battler.isEnemy();
};

Game_Enemy.prototype.isEnemyWith = function(battler) {
    return battler.isActor();
};

Game_Enemy.prototype.determineActionSkill = function() {
    // borrowed from Game_Enemy.selectAllActions()
    const validActions = this.enemy().actions.filter(a => this.isActionValid(a));
    
    const ratingMax = Math.max.apply(null, validActions.map(a => a.rating));
    const ratingZero = ratingMax - 3;

    const actionList = validActions.filter(a => a.rating > ratingZero);
    if (actionList.length) return $dataSkills[actionList[0].skillId];
};

Game_Enemy.prototype.die = function() {
    Game_Battler.prototype.die.call(this);
    this.performCollapse();
};

Game_Enemy.prototype.isEventErasable = function() {
    return this._effectTypeFulfilled;
};