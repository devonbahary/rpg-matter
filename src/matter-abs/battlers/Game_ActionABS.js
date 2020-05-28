//-----------------------------------------------------------------------------
// Game_ActionABS
//
// The game object class for a battle action in the ABS context.

function Game_ActionABS() {
    this.initialize.apply(this, arguments);
}

Game_ActionABS.prototype.initialize = function(subject, action) {
    this._subject = subject;
    this._item = new Game_Item();
    this._item.setObject(action);
};

Game_ActionABS.prototype.subject = function() {
    return this._subject;
};

Game_ActionABS.prototype.actionSequence = function() {
    return this._item.actionSequence();
};

Game_ActionABS.prototype.actionSequenceLength = function() {
    if (!this.actionSequence()) return 0;
    return Object.keys(this.actionSequence()).reduce((len, key) => {
        if (parseInt(key) > len) return parseInt(key);
        return len;
    }, 0);
};

Game_ActionABS.prototype.apply = function() {
    const targets = this.determineTargets();
    if (!targets.length) return;

    if (this.item().damage.type > 0) {
        for (const target of targets) {
            const critical = (Math.random() < this.itemCri(target));
            const value = this.makeDamageValue(target, critical);
            this.executeDamage(target, value);
            this.applyForce(target);
        }
    }
    // TODO
    // this.item().effects.forEach(function(effect) {
    //     this.applyItemEffect(target, effect);
    // }, this);
    // this.applyItemUserEffect(target);
};

Game_ActionABS.prototype.applyForce = function(target) {
    const subjectPosition = this._subject.character.body.position;
    const targetBody = target.character.body;

    const directionalVector = vectorFromAToB(subjectPosition, targetBody.position);
    const normalDirectionalVector = Vector.normalise(directionalVector);
    const forceVector = Vector.mult(normalDirectionalVector, 0.2);

    Body.applyForce(targetBody, subjectPosition, forceVector);
};

Game_ActionABS.prototype.determineTargets = function() {
    const bounds = $gamePlayer.squareInFrontOf();
    const battlersInRange = $gameMap.battlersInBoundingBox(bounds);

    if (this.isForOpponent()) {
        return battlersInRange.filter(battler => !this._subject.isFriendWith(battler));
    } else if (this.isForFriend()) {
        return battlersInRange.filter(battler => this._subject.isFriendWith(battler));
    }
    return battlersInRange;
};

Game_ActionABS.prototype.item = function() {
    return Game_Action.prototype.item.call(this);
};

Game_ActionABS.prototype.checkItemScope = function(list) {
    return Game_Action.prototype.checkItemScope.call(this, list);
};

Game_ActionABS.prototype.isForOpponent = function() {
    return Game_Action.prototype.isForOpponent.call(this);
};

Game_ActionABS.prototype.isForFriend = function() {
    return Game_Action.prototype.isForFriend.call(this);
};

Game_ActionABS.prototype.isForDeadFriend = function() {
    return Game_Action.prototype.isForDeadFriend.call(this);
};

Game_ActionABS.prototype.isForUser = function() {
    return Game_Action.prototype.isForUser.call(this);
};

Game_ActionABS.prototype.isForOne = function() {
    return Game_Action.prototype.isForOne.call(this);
};

Game_ActionABS.prototype.isForRandom = function() {
    return Game_Action.prototype.isForRandom.call(this);
};

Game_ActionABS.prototype.isForAll = function() {
    return Game_Action.prototype.isForAll.call(this);
};

Game_ActionABS.prototype.checkDamageType = function(list) {
    return Game_Action.prototype.checkDamageType.call(this, list);
};

Game_ActionABS.prototype.isHpEffect = function() {
    return Game_Action.prototype.isHpEffect.call(this);
};

Game_ActionABS.prototype.isMpEffect = function() {
    return Game_Action.prototype.isMpEffect.call(this);
};

Game_ActionABS.prototype.isDamage = function() {
    return Game_Action.prototype.isDamage.call(this);
};

Game_ActionABS.prototype.isRecover = function() {
    return Game_Action.prototype.isRecover.call(this);
};

Game_ActionABS.prototype.isDrain = function() {
    return Game_Action.prototype.isDrain.call(this);
};

Game_ActionABS.prototype.isHpRecover = function() {
    return Game_Action.prototype.isHpRecover.call(this);
};

Game_ActionABS.prototype.isMpRecover = function() {
    return Game_Action.prototype.isMpRecover.call(this);
};

Game_ActionABS.prototype.isCertainHit = function() {
    return Game_Action.prototype.isCertainHit.call(this);
};

Game_ActionABS.prototype.isPhysical = function() {
    return Game_Action.prototype.isPhysical.call(this);
};

Game_ActionABS.prototype.isMagical = function() {
    return Game_Action.prototype.isPhysical.call(this);
};

Game_ActionABS.prototype.itemCri = function(target) {
    return Game_Action.prototype.itemCri.call(this, target);
};

Game_ActionABS.prototype.makeDamageValue = function(target, critical) {
    return Game_Action.prototype.makeDamageValue.call(this, target, critical);
};

Game_ActionABS.prototype.evalDamageFormula = function(target) {
    return Game_Action.prototype.evalDamageFormula.call(this, target);
};

Game_ActionABS.prototype.calcElementRate = function(target) {
    return Game_Action.prototype.calcElementRate.call(this, target);
};

Game_ActionABS.prototype.elementsMaxRate = function(target, elements) {
    return Game_Action.prototype.elementsMaxRate.call(this, target, elements);
};

Game_ActionABS.prototype.applyCritical = function(damage) {
    return Game_Action.prototype.applyCritical.call(this, damage);
};

Game_ActionABS.prototype.applyVariance = function(damage, variance) {
    return Game_Action.prototype.applyVariance.call(this, damage, variance);
};

Game_ActionABS.prototype.applyGuard = function(damage, target) {
    return Game_Action.prototype.applyGuard.call(this, damage, target);
};

Game_ActionABS.prototype.executeDamage = function(target, value) {
    return Game_Action.prototype.executeDamage.call(this, target, value);
};

Game_ActionABS.prototype.executeHpDamage = function(target, value) {
    return Game_Action.prototype.executeHpDamage.call(this, target, value);
};

Game_ActionABS.prototype.executeMpDamage = function(target, value) {
    return Game_Action.prototype.executeMpDamage.call(this, target, value);
};

Game_ActionABS.prototype.gainDrainedHp = function(value) {
    return Game_Action.prototype.gainDrainedHp.call(this, value);
};

Game_ActionABS.prototype.gainDrainedMp = function(value) {
    return Game_Action.prototype.gainDrainedMp.call(this, value);
};

Game_ActionABS.prototype.makeSuccess = function() {
};

export default Game_ActionABS;