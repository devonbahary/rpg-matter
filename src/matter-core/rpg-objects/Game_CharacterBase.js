//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// The superclass of Game_Character. It handles basic information, such as
// coordinates and images, shared by all characters.

import { Body, Bodies, Events, Vector } from "matter-js";
import { isDown, isLeft, isRight, isUp } from "../utils/direction";
import MATTER_CORE from "../pluginParams";

Object.defineProperties(Game_CharacterBase.prototype, {
    _x: { get: function() { return this.body.position.x / MATTER_CORE.TILE_SIZE; }, configurable: false },
    _y: { get: function() { return this.body.position.y / MATTER_CORE.TILE_SIZE; }, configurable: false },
    _realX: { get: function() { return this.body.position.x / MATTER_CORE.TILE_SIZE; }, configurable: false },
    _realY: { get: function() { return this.body.position.y / MATTER_CORE.TILE_SIZE; }, configurable: false },
    radius: { get: function() { return this.width * MATTER_CORE.TILE_SIZE / 2; }, configurable: false },
});


Game_CharacterBase.prototype.initMembers = function() {
    this.initMembersOverwrite();
    this.width = 1;
    this.height = 1;
    this.initBody();
    this.setupMatterEvents();
    this.setDirection(2);
    this._heading = 2;
};

// overwrite to prevent writing of _realX, _realY
Game_CharacterBase.prototype.initMembersOverwrite = function() {
    this._moveSpeed = 4;
    this._moveFrequency = 6;
    this._opacity = 255;
    this._blendMode = 0;
    this._direction = 2;
    this._pattern = 1;
    this._priorityType = 1;
    this._tileId = 0;
    this._characterName = '';
    this._characterIndex = 0;
    this._isObjectCharacter = false;
    this._walkAnime = true;
    this._stepAnime = false;
    this._directionFix = false;
    this._through = false;
    this._transparent = false;
    this._bushDepth = 0;
    this._animationId = 0;
    this._balloonId = 0;
    this._animationPlaying = false;
    this._balloonPlaying = false;
    this._animationCount = 0;
    this._stopCount = 0;
    this._jumpCount = 0;
    this._jumpPeak = 0;
    this._movementSuccess = true;
};

Game_CharacterBase.prototype.initBody = function() {
    const parts = this.initBodyParts().map(part => ({ 
        ...part, 
        character: this,
    }));
    
    this.body = Body.create({
        parts,
        ...this.initBodyOptions(),
    });
};

Game_Character.prototype.initBodyParts = function() {
    return [ 
        this.initCharacterBody(),
    ];
};

Game_Character.prototype.initCharacterBody = function() {
    return Bodies.circle(0, 0, this.radius, this.initCharacterBodyOptions());
};

Game_CharacterBase.prototype.initBodyOptions = function() {
    return {
        frictionAir: 0.5, // 0-1
        // inertia: Infinity, // prevents angular velocity 
        restitution: 1, // 0-1 (inelastic and no bouncing may occur -> elastic and bounces back with ~100% of its kinetic energy)
    };
};

Game_Character.prototype.initCharacterBodyOptions = function() {
    return {};
};

/*
    set up collision events on the individual parts of the body, because this is where the collisions register
    set up unique handlers through listeners and triggers on the body
*/
Game_CharacterBase.prototype.setupMatterEvents = function() {
    for (const part of this.body.parts) {
        Events.on(part, 'collisionStart', this.onCollisionStart.bind(this));
        Events.on(part, 'collisionActive', this.onCollisionActive.bind(this));
        Events.on(part, 'collisionEnd', this.onCollisionEnd.bind(this));
    }  
};

Game_CharacterBase.prototype.onCollisionStart = function(event) {
};

Game_CharacterBase.prototype.onCollisionActive = function(event) {
};

Game_CharacterBase.prototype.onCollisionEnd = function(event) {
};

Game_CharacterBase.prototype.isMoving = function() {
    return this.body.speed.round();
};

Game_CharacterBase.prototype.realMoveSpeed = function() {
    return this._moveSpeed + (this.isDashing() ? MATTER_CORE.DASH_SPEED_BOOST : 0);
};

const _Game_CharacterBase_distancePerFrame = Game_CharacterBase.prototype.distancePerFrame;
Game_CharacterBase.prototype.distancePerFrame = function() {
    // arbitrary throttle on movement speed
    return _Game_CharacterBase_distancePerFrame.call(this) * MATTER_CORE.BASE_MOVE_SPEED; 
};

Game_CharacterBase.prototype.setPosition = function(x, y) {
    const tileSize = MATTER_CORE.TILE_SIZE;
    const worldX = x * tileSize + (this.width * tileSize / 2);
    const worldY = y * tileSize + (this.height * tileSize / 2);
    Body.setPosition(this.body, { x: worldX, y: worldY });
};

Game_CharacterBase.prototype.copyPosition = function(character) {
    Body.setPosition(this.body, character.body.position);
    this.setDirection(character._direction);
};

const _Game_CharacterBase_setDirection = Game_CharacterBase.prototype.setDirection;
Game_CharacterBase.prototype.setDirection = function(d) {
    _Game_CharacterBase_setDirection.call(this, d);
    this.updateBodyAngle();
};

Game_CharacterBase.prototype.screenX = function() {
    var tw = $gameMap.tileWidth();
    return Math.round(this.scrolledX() * tw);
};

Game_CharacterBase.prototype.screenY = function() {
    var th = $gameMap.tileHeight();
    return Math.round(this.scrolledY() * th + (th / 2) - this.shiftY() - this.jumpHeight());
};

Game_CharacterBase.prototype.updateBodyAngle = function () {
    let angle = this.body.angle;
    switch (this._direction) {
        case 2: // down
            angle = 90 * Math.PI / 180;
            break;
        case 4: // left
            angle = 180 * Math.PI / 180;
            break;
        case 6: // right
            angle = 0;
            break;
        case 8: // up
            angle = -90 * Math.PI / 180;
            break;
    }
    Body.setAngle(this.body, angle);
};

Game_CharacterBase.prototype.updateJump = function() {
    this._jumpCount--;
    this._realX = (this._realX * this._jumpCount + this._x) / (this._jumpCount + 1.0);
    this._realY = (this._realY * this._jumpCount + this._y) / (this._jumpCount + 1.0);
    this.refreshBushDepth();
    if (this._jumpCount === 0) {
        this._realX = this._x = $gameMap.roundX(this._x);
        this._realY = this._y = $gameMap.roundY(this._y);
    }
};

Game_CharacterBase.prototype.updateMove = function() {
    // overwrite; all movement is done through Matter.js
};

Game_CharacterBase.prototype.refreshBushDepth = function() {
    if (this.isNormalPriority() && !this.isObjectCharacter() &&
            this.isOnBush() && !this.isJumping()) {
        this._bushDepth = 12; // overwrote if (!this.isMoving()) condition
    } else {
        this._bushDepth = 0;
    }
};

Game_CharacterBase.prototype.isOnBush = function() {
    return $gameMap.isBush(this._x, this._y + this.height / 2);
};

Game_CharacterBase.prototype.move = function(dir) {
    if (!dir) return;

    const magnitude = this.distancePerFrame();
    const vector = { x: 0, y: 0 };
    const scalar = 1; // arbitrary, will be normalized

    if (isDown(dir)) vector.y = scalar;
    else if (isUp(dir)) vector.y = -scalar;

    if (isRight(dir)) vector.x = scalar;
    else if (isLeft(dir)) vector.x = -scalar;

    const normalizedVector = Vector.normalise(vector);
    const movementVector = Vector.mult(normalizedVector, magnitude);

    this.updateMovementDirection(dir);
    Body.applyForce(this.body, this.body.position, movementVector);

    this.increaseSteps();
};

Game_CharacterBase.prototype.updateMovementDirection = function(dir) {
    if (!dir || dir === this._heading) return;
    
    switch (this._direction) {
        case 2: // down
          if (isUp(dir)) this.setDirection(8);
          else if (isLeft(dir)) this.setDirection(4);
          else if (isRight(dir)) this.setDirection(6);
          break;
        case 4: // left
          if (isRight(dir)) this.setDirection(6);
          else if (isUp(dir)) this.setDirection(8);
          else if (isDown(dir)) this.setDirection(2);
          break;
        case 6: // right
          if (isLeft(dir)) this.setDirection(4);
          else if (isUp(dir)) this.setDirection(8);
          else if (isDown(dir)) this.setDirection(2);
          break;
        case 8: // up
          if (isDown(dir)) this.setDirection(2);
          else if (isLeft(dir)) this.setDirection(4);
          else if (isRight(dir)) this.setDirection(6);
          break;
      }

      this._heading = dir;
};

Game_CharacterBase.prototype.moveStraight = function(d) {
    this.setMovementSuccess(this.canPass(this._x, this._y, d));
    if (this.isMovementSucceeded()) {
        this.setDirection(d);
        this._x = $gameMap.roundXWithDirection(this._x, d);
        this._y = $gameMap.roundYWithDirection(this._y, d);
        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(d));
        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(d));
        this.increaseSteps();
    } else {
        this.setDirection(d);
        this.checkEventTriggerTouchFront(d);
    }
};

Game_CharacterBase.prototype.moveDiagonally = function(horz, vert) {
    this.setMovementSuccess(this.canPassDiagonally(this._x, this._y, horz, vert));
    if (this.isMovementSucceeded()) {
        this._x = $gameMap.roundXWithDirection(this._x, horz);
        this._y = $gameMap.roundYWithDirection(this._y, vert);
        this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(horz));
        this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(vert));
        this.increaseSteps();
    }
    if (this._direction === this.reverseDir(horz)) {
        this.setDirection(horz);
    }
    if (this._direction === this.reverseDir(vert)) {
        this.setDirection(vert);
    }
};

Game_CharacterBase.prototype.jump = function(xPlus, yPlus) {
    if (Math.abs(xPlus) > Math.abs(yPlus)) {
        if (xPlus !== 0) {
            this.setDirection(xPlus < 0 ? 4 : 6);
        }
    } else {
        if (yPlus !== 0) {
            this.setDirection(yPlus < 0 ? 8 : 2);
        }
    }
    this._x += xPlus;
    this._y += yPlus;
    var distance = Math.round(Math.sqrt(xPlus * xPlus + yPlus * yPlus));
    this._jumpPeak = 10 + distance - this._moveSpeed;
    this._jumpCount = this._jumpPeak * 2;
    this.resetStopCount();
    this.straighten();
};

Game_CharacterBase.prototype.distanceFrom = function(char) {
    return Vector.magnitude(Vector.add(this.body.position, Vector.neg(char.body.position)));
};