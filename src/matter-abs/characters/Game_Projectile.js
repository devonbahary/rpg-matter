//-----------------------------------------------------------------------------
// Game_Projectile
//
// The game object class for a projectile. 

import { vectorFromAToB, vectorResize } from "../../matter-core/utils/vector";
import { BODY_LABELS } from "../../matter-core/constants";

function Game_Projectile() {
    this.initialize.apply(this, arguments);
}

Game_Projectile.prototype = Object.create(Game_DynamicCharacter.prototype);
Game_Projectile.prototype.constructor = Game_Projectile;

Game_Projectile.prototype.initBodyOptions = function() {
    return {
        ...Game_Character.prototype.initBodyOptions.call(this),
        frictionAir: 0,
        friction: 0,
        restitution: 1,
    };
};

Game_Projectile.prototype.onCollisionStart = function(event) {
    Game_Character.prototype.onCollisionStart.call(this, event);
    if (event.pair.character) {
        if (this._action.determineTargets().length) this._action.apply();
        if (event.pair.character.battler) this.removeFromScene();
    } else if (event.pair.label === BODY_LABELS.ENVIRONMENT) {
        this.removeFromScene();
    }
};

Game_Projectile.prototype.start = function() {
    const projectileVector = vectorFromAToB(this._action.subject().character.mapPos, this.mapPos);
    const forceVector = vectorResize(projectileVector, this._action.projectileForce());
    this.applyForce(forceVector);
};

global["Game_Projectile"] = Game_Projectile;