//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

import { Bodies, Engine, Events, Render, World } from "matter-js";
import { getTilemapCollisionObjects, getTilemapPropertyMatrix } from "../utils/tilemap";
import { getPathTo } from "../utils/pathfinding";
import MATTER_CORE from "../pluginParams";

const Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    Game_Map_setup.call(this, mapId);
    this.tilemapPropertyMatrix = getTilemapPropertyMatrix.call(this);
    this.setupMatter();
};

Game_Map.prototype.setupMatter = function() {
    this.setupMatterEngine();
    this.setupMatterEvents();
    this.setupMatterRender();
    this.setupMatterBodies();
};

Game_Map.prototype.setupMatterEngine = function() {
    this.engine = Engine.create();

    const maxWidth = this.width() * this.tileWidth();
    const maxHeight = this.height() * this.tileHeight();
    this.engine.world.bounds = { // TODO: wanted?
        min: { x: 0, y: 0 },
        max: { x: maxWidth, y: maxHeight },
    };

    this.engine.world.gravity.scale = 0;
};

Game_Map.prototype.setupMatterEvents = function() {
    const collisionEvents = [ 'collisionStart', 'collisionActive', 'collisionEnd' ];
    for (const eventName of collisionEvents) {
        Events.on(this.engine, eventName, event => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB } = pair;
                Events.trigger(bodyA, eventName, { pair: bodyB });
                Events.trigger(bodyB, eventName, { pair: bodyA });
            }
        });
    }
}; 

Game_Map.prototype.setupMatterRender = function() {
    if (!MATTER_CORE.RENDER_IS_DISPLAY) return;
    if (this.render) this.disposeMatterRender();
    this.render = Render.create({
        element: document.querySelector('#matter-render'),
        engine: this.engine,
        options: {
            width: MATTER_CORE.RENDER_WIDTH,
            height: MATTER_CORE.RENDER_HEIGHT,
            showCollisions: true,
            showAngleIndicator: true,
            showVelocity: true,
            showSeparations: true,
            showIds: true,
            showShadows: true,
        },
    });

    Render.lookAt(this.render, this.engine.world.bounds);

    Render.run(this.render);
};

Game_Map.prototype.disposeMatterRender = function() {
    if (!MATTER_CORE.RENDER_IS_DISPLAY) return;
    Render.stop(this.render);
    this.render.canvas.remove();
};

Game_Map.prototype.setupMatterBodies = function() {
    this.addEnvironment();
    this.addPlayer();
    this.addEvents();  
};

Game_Map.prototype.addEnvironment = function() {
    const tilemapCollisionObjects = getTilemapCollisionObjects.call(this);
    for (const collisionObject of tilemapCollisionObjects) {
        const { x1, x2, y1, y2 } = collisionObject;
        
        const tileSize = MATTER_CORE.TILE_SIZE;
        const width = (x2 - x1) * tileSize;
        const height = (y2 - y1) * tileSize;
        const x = x1 * tileSize + width / 2;
        const y = y1 * tileSize + height / 2;

        const body = Bodies.rectangle(x, y, width, height, { isStatic: true });
        this.addBody(body);
    };
};

Game_Map.prototype.addPlayer = function() {
    this.addBody($gamePlayer.body);
};

Game_Map.prototype.addEvents = function() {
    for (const event of this.events()) {
        this.addBody(event.body)
    }
};

const _Game_Map_tileId = Game_Map.prototype.tileId;
Game_Map.prototype.tileId = function(x, y, z) {
    return _Game_Map_tileId.call(this, Math.floor(x), Math.floor(y), z);
};

const _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
    _Game_Map_update.call(this, sceneActive);
    Engine.update(this.engine);
};

Game_Map.prototype.addBody = function(body) {
    World.add(this.engine.world, body);
};

Game_Map.prototype.terminate = function() {
    Engine.clear(this.engine);
    Events.off(this.engine);
    this.disposeMatterRender();
};

Game_Map.prototype.findPath = function(startPos, endPos) {
    return getPathTo.call(this, startPos, endPos);
};