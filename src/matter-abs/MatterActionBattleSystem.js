//=============================================================================
// MatterActionBattleSystem
//=============================================================================

/*:
 * @plugindesc Action Battle System
 * Requires MatterCore.js plugin.
 * 
 * @help
 * 
 * Database > Actors / Enemies
 *      An Event's page can take on the identity of an Actor or an Enemy by 
 *      placing the <actorId:id> / <enemyId:id> tag in a Comment command.
 * 
 *      The inheritable character properties of an Event from its battler can be
 *      specified through the database Note meta:
 * 
 *      <characterName:string>
 *          Sets the characterName property (character file name).
 *      <characterIndex:number>
 *          Sets the characterIndex property (0-7, character set from left to 
 *          right, top to bottom)
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
 *          sets the force for the skill; a value of 1 will knock back a target 
 *          of equal mass about 1 tile
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
import "./units/Game_Unit";
import "./units/Game_TroopABS";
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
    NORMAL_ATTACK_MISS_SE: {
        name: PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss SE"],
        volume: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss Volume"]),
        pitch: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss Pitch"]),
    },
};