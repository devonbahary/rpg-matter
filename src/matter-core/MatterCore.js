//=============================================================================
// MatterCore
//=============================================================================

/*:
 * @plugindesc The core plugin for the RPG Maker MV Matter.js "game engine".
 * https://brm.io/matter-js/
 * 
 * @help
 * 
 * Events
 *    You can specify properties of an Event specific to its page by including
 *    any of the following tags in a Comment command.
 * 
 *    <mass:number|character mass>
 *      Sets the mass for an Event, either a specific number or any of the below
 *      options defined in param "Character Masses". Events not specified to have
 *      a mass will default to static.
 *        - Very Light
 *        - Light
 *        - Normal
 *        - Heavy
 *        - Very Heavy
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
 * @param Character Masses
 * @parent Character
 * @type struct<CharacterMasses>
 * 
 * @param Default Character Mass
 * @parent Character
 * @type select
 *    @option Very Light
 *    @value Very Light
 *    @option Light
 *    @value Light
 *    @option Normal
 *    @value Normal
 *    @option Heavy
 *    @value Heavy
 *    @option Very Heavy
 *    @value Very Heavy
 * @default Normal
 * 
 * 
 * @param Player
 * 
 * @param Dash Speed Boost
 * @parent Player
 * @desc Bonus to movement speed while dashing (0-1.5)
 * @type number
 * @default 1
 * @decimals 2
 * @min 0
 * @max 1.5
 * 
 * @param Interaction Radius
 * @parent Player
 * @desc The distance (in units of player length) the player can interact with action button events in front of it
 * @type number
 * @default 1
 * @decimals 2
 * @min 0.1
 * @max 3
 * 
 * @param Event
 * 
 * @param Touch Event Cooldown
 * @parent Event
 * @desc The time (in frames) before an Event with trigger Player Touch or Event Touch can be triggered again
 * @type number
 * @default 60
 * @min 1
 * @max 3600
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

/*~struct~CharacterMasses:
 * @param Very Light
 * @type number
 * @default 25
 * 
 * @param Light
 * @type number
 * @default 50
 * 
 * @param Normal
 * @type number
 * @default 100
 * 
 * @param Heavy
 * @type number
 * @default 500
 * 
 * @param Very Heavy
 * @type number
 * @default 1000
 * 
*/

import './rpg_core';
import './rpg-objects/Game_CharacterBase';
import './rpg-objects/Game_Character';
import './rpg-objects/Game_Event';
import './rpg-objects/Game_Player';
import './rpg-objects/Game_Party';
import './rpg-objects/Game_Map';
import './rpg-objects/Game_Temp';
import './scenes/Scene_Map';
import './matter/Pair';

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