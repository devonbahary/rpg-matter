//-----------------------------------------------------------------------------
// Game_Map
//
// The game object class for a map. It contains scrolling and passage
// determination functions.

import { Bodies, Engine, Render, World } from "matter-js";
import { getTilemapCollisionObjects } from "./utils/tilemap";

const MAP_BOUNDARY_THICKNESS = 20;

const Game_Map_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
  Game_Map_setup.call(this, mapId);
  this.setupMatter();
};

Game_Map.prototype.setupMatter = function() {
  this.setupMatterEngine();
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

Game_Map.prototype.setupMatterRender = function() {
  const render = Render.create({
    element: document.querySelector('#matter-render'),
    engine: this.engine,
    options: {
      width: 200,
      height: 200,
      showCollisions: true,
      showAngleIndicator: true,
      showVelocity: true,
      showSeparations: true,
      showPositions: true,
      showIds: true,
      showShadows: true,
    },
  });

  Render.lookAt(render, this.engine.world.bounds);

  Render.run(render);
};

Game_Map.prototype.setupMatterBodies = function() {
  this.addEnvironment();
  this.addPlayer();
  this.addEvents();  
};

Game_Map.prototype.addEnvironment = function() {
  const tw = this.tileWidth();
  const th = this.tileHeight();
  
  getTilemapCollisionObjects(this).forEach(({ x1, x2, y1, y2 }) => {
    const width = (x2 - x1) * tw;
    const height = (y2 - y1) * th;
    const x = x1 * tw + width / 2;
    const y = y1 * th + height / 2;
    const body = Bodies.rectangle(x, y, width, height, { isStatic: true });
    this.addBody(body);
  });
};

Game_Map.prototype.addPlayer = function() {
  this.addBody($gamePlayer.body);
};

Game_Map.prototype.addEvents = function() {
  this.events().forEach(e => {
    this.addBody(e.body);
  });
};

const _Game_Map_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
  _Game_Map_update.call(this, sceneActive);
  Engine.update(this.engine);
};

Game_Map.prototype.addBody = function(body) {
  World.add(this.engine.world, body);
};

Game_Map.prototype.clearEngine = function() {
  Engine.clear(this.engine);
};