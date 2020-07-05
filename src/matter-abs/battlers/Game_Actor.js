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
    damageCharacterName: { get: function() { return this.data.meta.damageCharacterName; }, configurable: false },
    damageCharacterIndex: { get: function() { return parseInt(this.data.meta.damageCharacterIndex); }, configurable: false },
    damageCharacterDir: { get: function() { return parseInt(this.data.meta.damageCharacterDir); }, configurable: false },
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
    this.actionSlots = new Array(5);
};

Game_Actor.prototype.displayableActionSlotKeyMap = function() {
    return {
        'D': new Game_Item($dataSkills[this.attackSkillId()]),
        'S': this.actionSlots[0],
        'A': this.actionSlots[1],
        'Q': this.actionSlots[2],
        'W': this.actionSlots[3],
        'E': this.actionSlots[4],
    }
};

Game_Actor.prototype.setActionSlot = function(index, action) {
    this.actionSlots[index] = new Game_Item(action);
};

Game_Actor.prototype.setActionBySlot = function(index) {
    const action = this.actionSlots[index];
    if (!action) return;
    this.setAction(action.object());
};

Game_Actor.prototype.hitStunResist = function(withGuard) {
    const baseValue = Game_Battler.prototype.hitStunResist.call(this);
    const excludeEtypeIds = !withGuard ? MATTER_ABS.HIT_STUN_RESIST_GUARD_ONLY_ETYPE_IDS : [];
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

// overwrite (formerly pushed to $gameMessage)
Game_Actor.prototype.displayLevelUp = function(newSkills) {
    for (const skill of newSkills) {
        $gameMap.addLog({
            iconIndex: skill.iconIndex,
            message: TextManager.obtainSkill.format(skill.name),
        });
    }
    $gameMap.addLog({
        iconIndex: MATTER_ABS.WINDOW_LEVEL_UP_ICON_INDEX,
        message: TextManager.levelUp.format(this._name, TextManager.level, this._level),
    });
};

// overwrite to include (code, id)
Game_Actor.prototype.traitObjects = function(code, id) {
    var objects = Game_Battler.prototype.traitObjects.call(this, code, id);
    objects = objects.concat([this.actor(), this.currentClass()]);
    var equips = this.equips();
    for (var i = 0; i < equips.length; i++) {
        var item = equips[i];
        if (item) {
            objects.push(item);
        }
    }
    return objects;
};

Game_Actor.prototype.die = function() {
    Game_Battler.prototype.die.call(this);
    SoundManager.playActorCollapse();
    if (this.damageCharacterName) {
        this.setCharacterImage(this.damageCharacterName, this.damageCharacterIndex);
        $gamePlayer.setDirection(this.damageCharacterDir);
        $gamePlayer.setDirectionFix(true);
    }
    $gamePlayer.refresh();
};