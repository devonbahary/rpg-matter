//-----------------------------------------------------------------------------
// Game_CharacterBase
//
// The superclass of Game_Character. It handles basic information, such as
// coordinates and images, shared by all characters.

import { Body, Bodies, Events, Vector } from "matter-js";
import { 
    isDown, 
    isLeft, 
    isRight, 
    isUp, 
    getAngleFromDirection, 
    get8DirFromAngle,
    get8DirFromHorzVert, 
    get8DirFromVector, 
} from "../utils/direction";
import { toWorldVectorCentered, vectorFromAToB, vectorLengthFromAToB } from "../utils/vector";
import MATTER_CORE from "../pluginParams";

Object.defineProperties(Game_CharacterBase.prototype, {
    _direction: { get: function() { return get8DirFromAngle(this.body.angle); }, configurable: false },
    _x: { get: function() { return this.worldX / MATTER_CORE.TILE_SIZE; }, configurable: false },
    _y: { get: function() { return this.worldY / MATTER_CORE.TILE_SIZE; }, configurable: false },
    _realX: { get: function() { return this._x; }, configurable: false },
    _realY: { get: function() { return this._y; }, configurable: false },
    mapPos: { get: function() { return { x: this.x, y: this.y }; }, configurable: false },
    radius: { get: function() { return this.width * MATTER_CORE.TILE_SIZE / 2; }, configurable: false },
    worldX: { get: function() { return this.body.position.x; }, configurable: false },
    worldY: { get: function() { return this.body.position.y; }, configurable: false },
});


Game_CharacterBase.prototype.initMembers = function() {
    this.initMembersOverwrite();
    this.clearPathfinding();
    this.setDimensions();
    this.initBody();
    this.setupMatterEvents();
    this.setDirection(2);
    this._heading = 2;
};

// overwrite to prevent writing of _realX, _realY, _direction, which are now getters
Game_CharacterBase.prototype.initMembersOverwrite = function() {
    this._moveSpeed = 4;
    this._moveFrequency = 6;
    this._opacity = 255;
    this._blendMode = 0;
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

Game_CharacterBase.prototype.pos = function(x, y) {
    return this._x.isInRange(x, x + 1) && this._y.isInRange(y, y + 1); // overwrite
};

Game_CharacterBase.prototype.setDimensions = function(width = 1, height = 1) {
    this.width = width;
    this.height = height;
};

Game_CharacterBase.prototype.initBody = function() {
    const parts = this.initBodyParts().map(part => ({ 
        ...part, 
        character: this,
    }));

    // every Game_CharacterBase.body is a compound body made up of potentially multiple parts
    this.body = Body.create({
        parts,
        ...this.initBodyOptions(),
    });
};

Game_CharacterBase.prototype.initBodyParts = function() {
    return [ 
        this.initCharacterBody(),
    ];
};

Game_CharacterBase.prototype.initCharacterBody = function() {
    return Bodies.circle(0, 0, this.radius, this.initCharacterBodyOptions());
};

Game_CharacterBase.prototype.initBodyOptions = function() {
    return {
        frictionAir: 0.5, // 0-1
        // inertia: Infinity, // prevents angular velocity 
        restitution: 1, // 0-1 (inelastic and no bouncing may occur -> elastic and bounces back with ~100% of its kinetic energy)
    };
};

Game_CharacterBase.prototype.initCharacterBodyOptions = function() {
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

Game_CharacterBase.prototype.clearDestination = function() {
    this._destinationX = this._destinationY = null;
};

Game_CharacterBase.prototype.isMoving = function() {
    return this.body.speed.round();
};

Game_CharacterBase.prototype.hasDestination = function() {
    return (
        this._pathfindingQueue.length || 
        (this._destinationX !== null && this._destinationY !== null)
    );
};

Game_CharacterBase.prototype.realMoveSpeed = function() {
    return this._moveSpeed + (this.isDashing() ? MATTER_CORE.DASH_SPEED_BOOST : 0);
};

const _Game_CharacterBase_distancePerFrame = Game_CharacterBase.prototype.distancePerFrame;
Game_CharacterBase.prototype.distancePerFrame = function() {
    return _Game_CharacterBase_distancePerFrame.call(this) * MATTER_CORE.BASE_MOVE_SPEED; 
};

Game_CharacterBase.prototype.setPosition = function(x, y) {
    Body.setPosition(this.body, toWorldVectorCentered({ x, y }));
};

Game_CharacterBase.prototype.copyPosition = function(character) {
    Body.setPosition(this.body, character.body.position);
    this.setDirection(character._direction);
};

Game_CharacterBase.prototype.setDirection = function(d) {
    if (this.isDirectionFixed() || !d) return; // overwrite; used to set _direction
    this.resetStopCount();
    Body.setAngle(this.body, getAngleFromDirection(d));
};

Game_CharacterBase.prototype.screenX = function() {
    var tw = $gameMap.tileWidth();
    return Math.round(this.scrolledX() * tw);
};

Game_CharacterBase.prototype.screenY = function() {
    var th = $gameMap.tileHeight();
    return Math.round(this.scrolledY() * th + (th / 2) - this.shiftY() - this.jumpHeight());
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

const _Game_CharacterBase_update = Game_CharacterBase.prototype.update;
Game_CharacterBase.prototype.update = function() {
    _Game_CharacterBase_update.call(this);
    this.updateMoveToDestination();
};

Game_CharacterBase.prototype.updateMove = function() {
    // overwrite; all movement is done through Matter
};

Game_CharacterBase.prototype.updateMoveToDestination = function() {
    if (!this.hasDestination()) return;

    const destinationWorldPosVector = toWorldVectorCentered({ x: this._destinationX, y: this._destinationY });
    const vectorToDestination = vectorFromAToB(this.body.position, destinationWorldPosVector);
    
    const normalizedVector = Vector.normalise(vectorToDestination);
    const forceVector = Vector.mult(normalizedVector, this.distancePerFrame());

    Body.applyForce(this.body, this.body.position, forceVector);

    if (Vector.magnitude(this.body.velocity) >= Vector.magnitude(vectorToDestination)) {
        Body.setPosition(this.body, destinationWorldPosVector);
        Body.setVelocity(this.body, { x: 0, y: 0 });
        this.shiftPathfindingQueue();
    } else {
        const dir = get8DirFromVector(vectorToDestination);
        this.updateMovementDirection(dir);  
    }

    this.increaseSteps();
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

// overwrite
Game_CharacterBase.prototype.moveStraight = function(d) {
    this.move(d); 
};

// overwrite
Game_CharacterBase.prototype.moveDiagonally = function(horz, vert) {
    const d = get8DirFromHorzVert(horz, vert);
    this.move(d); 
};

Game_CharacterBase.prototype.moveTo = function(x, y) {
    // TODO: add clearance check
    if (!$gameMap.isValid(x, y)) return;
    this._destinationX = x;
    this._destinationY = y;
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
    return vectorLengthFromAToB(this.body.position, char.body.position);
};

Game_CharacterBase.prototype.pathfindTo = function(pos) {
    if (!$gameMap.isValid(pos.x, pos.y)) return;
    this._pathfindingQueue = $gameMap.findPath(this.mapPos, pos, this);
    this._pathfindingDestinationPos = toWorldVectorCentered(pos);
    this.shiftPathfindingQueue();
};

Game_CharacterBase.prototype.shiftPathfindingQueue = function() {
    this.clearDestination();
    const nextDestination = this._pathfindingQueue.shift();
    if (nextDestination) {
        this.moveTo(nextDestination.x, nextDestination.y);
    } else {
        const vectorToDestination = vectorFromAToB(this.body.position, this._pathfindingDestinationPos);
        this.setDirection(get8DirFromVector(vectorToDestination));
        this.clearPathfinding();
    }
};

Game_CharacterBase.prototype.clearPathfinding = function() {
    this._pathfindingQueue = [];
    this._pathfindingDestinationPos = null;
    this.clearDestination();
};