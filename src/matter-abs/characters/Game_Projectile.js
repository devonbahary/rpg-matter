//-----------------------------------------------------------------------------
// Game_Projectile
//
// The game object class for a projectile. 

import { vectorFromAToB, vectorResize } from "../../matter-core/utils/vector";
import { BODY_LABELS } from "../../matter-core/constants";

function Game_Projectile() {
    this.initialize.apply(this, arguments);
}

Game_Projectile.prototype = Object.create(Game_Character.prototype);
Game_Projectile.prototype.constructor = Game_Projectile;

Game_Projectile.prototype.initialize = function(battler, action) {
    this._battler = battler;
    this._action = new Game_ActionABS(battler, action.item());
    this._action.setSubjectCharacter(this);
    Game_Character.prototype.initialize.call(this);
};

Game_Projectile.prototype.initMembers = function() {
    Game_Character.prototype.initMembers.call(this);
    const battlerDirection = this._battler.character.direction();
    if (this._action.iconIndex) {
        this.iconIndex = this._action.iconIndex;
        let iconRotation = this._action.iconRotation;
        
        if (iconRotation) {
            switch (battlerDirection) {
                case 4: 
                    iconRotation += 90;
                    break;
                case 6:
                    iconRotation -= 90;
                    break;
                case 8:
                    iconRotation += 180;
                    break;
                case 2:
                default:
                    break;
            }
            this.iconRotation = iconRotation * Math.PI / 180;
            this.iconRotationSpeed = this._action.iconRotationSpeed;
        }
        
    } else if (this._action.imageName) {
        this.setImage(this._action.imageName, this._action.imageIndex);
    }
    this.setDirection(battlerDirection);
    this.setDirectionFix(this._action.directionFix);
    this.setThrough(this._action.through); 
    this.setStepAnime(this._action.stepAnime);
};

Game_Projectile.prototype.setDimensions = function(width = 1, height = 1) {
    Game_Character.prototype.setDimensions.call(this, 0.8, 0.8);
};

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
        if (!this._action.determineTargets().length) return;
        this._action.apply();
        this.removeFromScene();
    } else if (event.pair.label === BODY_LABELS.ENVIRONMENT) {
        this.removeFromScene();
    }
};

Game_Projectile.prototype.setInFrontOfCharacter = function(character) {
    const distance = character.radius + this.radius;

    let projectileX, projectileY;
    switch (character.direction()) {
        case 2:
            projectileX = character.x0;
            projectileY = character.y0 + distance;
            break;
        case 4:
            projectileX = character.x0 - distance;
            projectileY = character.y0;
            break;
        case 6:
            projectileX = character.x0 + distance;
            projectileY = character.y0;
            break;
        case 8:
            projectileX = character.x0;
            projectileY = character.y0 - distance;
            break;
    }

    this.locate(projectileX, projectileY);
};

Game_Projectile.prototype.start = function() {
    const projectileVector = vectorFromAToB(this._action.subject().character.mapPos, this.mapPos);
    const forceVector = vectorResize(projectileVector, this._action.projectileForce());
    this.applyForce(forceVector);
};

global["Game_Projectile"] = Game_Projectile;