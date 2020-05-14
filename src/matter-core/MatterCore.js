//=============================================================================
// MatterCore
//=============================================================================

/*:
 * @plugindesc The core plugin for the RPG Maker MV Matter.js "game engine".
 * https://brm.io/matter-js/
 * 
 * @param Tile Size
 * @desc Length of square tile in pixels (1-128)
 * @type number
 * @default 48
 * @min 1
 * @max 128
 * 
 * @param Character
 * 
 * @param Base Move Speed
 * @parent Character
 * @desc 1: slowest, 6: fastest
 * @type number
 * @default 3
 * @min 1
 * @max 6
 * 
 * @param Dash Speed Boost
 * @parent Character
 * @desc Bonus to movement speed while dashing (0-1.5)
 * @type number
 * @default 1
 * @decimals 2
 * @min 0
 * @max 1.5
 * 
 * @param Interaction Radius
 * @parent Character
 * @desc The distance (in units of player length) the player can interact with action button events in front of it
 * @type number
 * @default 1
 * @decimals 2
 * @min 0.1
 * @max 3
 * 
 * @param Matter Render
 * 
 * @param Display Render
 * @parent Matter Render
 * @desc Display Matter.js world Render
 * @type boolean
 * @default false
 * 
 * @param Render Width
 * @parent Matter Render
 * @desc Window width in pixels (50-1000)
 * @type number
 * @default 200
 * @min 50
 * @max 1000
 * 
 * @param Render Height
 * @parent Matter Render
 * @desc Window height in pixels (50-1000)
 * @type number
 * @default 200
 * @min 50
 * @max 1000
 * 
 * @param Click To Move Dash
 * @desc Toggle whether the player will dash during click to move
 * @type boolean
 * @default true
 * 
 * @param Playtest Engine Timing
 
 * @param Playtest Timescale On Button Press
 * @parent Playtest Engine Timing
 * @desc Toggle playtest timescaling through button press
 * @type boolean
 * @default false
 * 
 * @param Playtest Timescale Key Code
 * @parent Playtest Engine Timing
 * @desc Key code to press for timescale adjustment
 * @type number
 * @default 17
 * @min 0
 * @max 255
 * 
 * @param Playtest Timescale
 * @parent Playtest Engine Timing
 * @desc 0 freezes the simulation, 0.1 gives a slow-motion effect, 1.2 gives a speed-up effect
 * @default 0.5
 * @min 0
 * @max 5
*/

import './rpg_core';
import './rpg-objects/Game_CharacterBase';
import './rpg-objects/Game_Event';
import './rpg-objects/Game_Player';
import './rpg-objects/Game_Party';
import './rpg-objects/Game_Map';
import './rpg-objects/Game_Temp';
import './matter/collision-on-rotate-bugfix';

const _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
  _Scene_Map_terminate.call(this);
  $gameMap.terminate();
};

//-----------------------------------------------------------------------------
// Scene_Boot
//
// The scene class for initializing the entire game.

Scene_Boot.prototype.start = function() {
  Scene_Base.prototype.start.call(this);
  SoundManager.preloadImportantSounds();
  if (DataManager.isBattleTest()) {
      DataManager.setupBattleTest();
      SceneManager.goto(Scene_Battle);
  } else if (DataManager.isEventTest()) {
      DataManager.setupEventTest();
      SceneManager.goto(Scene_Map);
  } else {
      this.checkPlayerLocation();
      DataManager.setupNewGame();
      SceneManager.goto(Scene_Map); // overwrite
      Window_TitleCommand.initCommandPosition();
  }
  this.updateDocumentTitle();
};