//-----------------------------------------------------------------------------
// Game_DynamicCharacter
//
// The game object class for a character created after map setup. 

function Game_DynamicCharacter() {
    this.initialize.apply(this, arguments);
}

Game_DynamicCharacter.prototype = Object.create(Game_Character.prototype);
Game_DynamicCharacter.prototype.constructor = Game_DynamicCharacter;

Game_DynamicCharacter.prototype.initialize = function(battler, action) {
    this._battler = battler;
    this._action = new Game_ActionABS(battler, action.item());
    this._action.setSubjectCharacter(this);
    Game_Character.prototype.initialize.call(this);
};

Game_DynamicCharacter.prototype.initMembers = function() {
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

Game_DynamicCharacter.prototype.setDimensions = function(width = 1, height = 1) {
    Game_Character.prototype.setDimensions.call(this, 0.8, 0.8);
};

Game_DynamicCharacter.prototype.setInFrontOfCharacter = function(character) {
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

global["Game_DynamicCharacter"] = Game_DynamicCharacter;