//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

import MATTER_ABS from "../MatterActionBattleSystem";

function getMetaFromEquips(metaProperty, excludeEtypeIds = []) {
    return this.equips().reduce((acc, item) => {
        if (!item) return acc;
        if (excludeEtypeIds.length && excludeEtypeIds.includes(item.etypeId)) return acc;
        const meta = parseInt(item.meta[metaProperty]);
        if (isNaN(meta)) return acc;
        return acc + meta;
    }, 0);
}

Object.defineProperties(Game_Actor.prototype, {
    data: { get: function() { return this.actor(); }, configurable: false },
    imageName: { get: function() { return this._characterName; }, configurable: false },
    imageIndex: { get: function() { return this._characterIndex; }, configurable: false },
    weapon: { get: function() { 
        return this._equips.reduce((weapon, item) => {
            if (weapon) return weapon;
            if (DataManager.isWeapon(item.object())) return item;
            return weapon;
        }, null);
    }, configurable: false },
    weaponIconIndex: { get: function() { return this.weapon ? this.weapon.object().iconIndex : 0; }, configurable: false },
});

const _Game_Actor_initMembers = Game_Actor.prototype.initMembers;
Game_Actor.prototype.initMembers = function() {
    _Game_Actor_initMembers.call(this);
    this.initActionSlots();
};

Game_Actor.prototype.initActionSlots = function() {
    this.actionSlots = new Array(2);
    this.actionSlots[0] = new Game_Item($dataSkills[this.attackSkillId()]);
    this.actionSlots[1] = new Game_Item($dataSkills[this.guardSkillId()]);
};

Game_Actor.prototype.setActionSlot = function(index, action) {
    this.actionSlots[index] = new Game_Item(action);
};

Game_Actor.prototype.setActionBySlot = function(index) {
    const action = this.actionSlots[index];
    if (!action) return;
    this.setAction(action.object());
};

Game_Actor.prototype.hitStunResist = function() {
    const baseValue = Game_Battler.prototype.hitStunResist.call(this);
    const excludeEtypeIds = !this.isGuard() ? MATTER_ABS.HIT_STUN_RESIST_GUARD_ONLY_ETYPE_IDS : [];
    const equipsValue = getMetaFromEquips.call(this, 'hitStunResist', excludeEtypeIds);
    const value = baseValue + equipsValue;
    
    const actorValue = parseInt(this.data.meta.hitStunResist);
    if (isNaN(actorValue)) return value + MATTER_ABS.DEFAULT_ACTOR_HIT_STUN_RESIST;

    return value + actorValue;
};

Game_Actor.prototype.isFriendWith = function(battler) {
    return battler.isActor();
};

Game_Actor.prototype.isEnemyWith = function(battler) {
    return battler.isEnemy();
};

Game_Actor.prototype.expRate = function() {
    return (this.currentExp() - this.currentLevelExp()) / (this.nextLevelExp() - this.currentLevelExp());
};