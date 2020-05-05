//=============================================================================
// Matter
//=============================================================================

/*:
 * @plugindesc Matter.
 * 
 * 
 * @param Base Move Speed
 * @desc 1: slowest, 6: fastest
 * @type number
 * @default 4
 * @min 1
 * @max 6
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
 * @type number
 * @default 200
 * @min 50
 * @max 1000
 * 
 * @param Render Height
 * @parent Matter Render
 * @type number
 * @default 200
 * @min 50
 * @max 1000
 * 
*/

import './rpg_core';
import './rpg-objects/Game_CharacterBase';
import './rpg-objects/Game_Event';
import './rpg-objects/Game_Player';
import './rpg-objects/Game_Party';
import './rpg-objects/Game_Map';

const _Scene_Map_terminate = Scene_Map.prototype.terminate;
Scene_Map.prototype.terminate = function() {
  _Scene_Map_terminate.call(this);
  $gameMap.clearEngine();
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