//=============================================================================
// MatterActionBattleSystem
//=============================================================================

/*:
 * @plugindesc Action Battle System
 * Requires MatterCore.js plugin.
 * 
 * @help
 * 
 * Events
 *      You can specify properties of an Event specific to its page by including
 *      any of the following tags in a Comment command.
 * 
 *      <actorId:id>
 *          Sets this Event's battler to be Actor with id.
 *      <enemyId:id>
 *          Sets this Event's battler to be Enemy with id.
 * 
 * Database > Skills 
 *      <actionSeq:ACTION_KEY>
 *          sets the action sequence ACTION_KEY defined in the plugin files for 
 *          the skill
 *      <force:Number>
 *          sets the force for the skill (multiplied by Force Base)
 * 
 * 
 * @param Battler HUD
 * 
 * @param Gauge Height
 * @parent Battler HUD
 * @desc Height (in pixels) of battler HUD gauge
 * @type number
 * @min 4
 * @max 20
 * @default 6
 * 
 * @param Battler
 * 
 * @param Force Base
 * @parent Battler
 * @desc Base force that is multiplied by each action's specified force
 * @type number
 * @decimals 2
 * @min 0.1
 * @max 5
 * @default 0.2
 * 
 * @param Normal Attack Miss SE
 * @parent Battler
 * @desc Audio file played when normal attacks hit nothing
 * @type file
 * @dir audio/se
 * @default Wind7
 * 
 * @param Normal Attack Miss Volume
 * @parent Battler
 * @desc Audio volume when normal attacks hit nothing
 * @type number
 * @min 0
 * @max 100
 * @default 90
 * 
 * @param Normal Attack Miss Pitch
 * @parent Battler
 * @desc Audio pitch when normal attacks hit nothing
 * @type number
 * @min 50
 * @max 150
 * @default 100
*/

import "./battlers/Game_Item";
import "./battlers/Game_BattlerBase";
import "./battlers/Game_Battler";
import "./battlers/Game_Actor";
import "./battlers/Game_Enemy";
import "./characters/Game_CharacterBase";
import "./characters/Game_Character";
import "./characters/Game_Player";
import "./characters/Game_Event";
import "./Game_Map";
import "./sprites/Sprite_BattlerParameters";
import "./sprites/Sprite_CharacterWeapon";
import "./sprites/Sprite_Character";
import "./action-sequences/action-sequences";

export default {
    GAUGE_HEIGHT: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Gauge Height"]),
    BASE_FORCE: Number(PluginManager.parameters('MatterActionBattleSystem')["Force Base"]),
    NORMAL_ATTACK_MISS_SE: {
        name: PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss SE"],
        volume: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss Volume"]),
        pitch: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss Pitch"]),
    },
};