//=============================================================================
// MatterActionBattleSystem
//=============================================================================

/*:
 * @plugindesc Action Battle System
 * Requires MatterCore.js plugin.
 * 
 * @help
 * 
 * Database > Skills 
 *      <actionSeq:ACTION_KEY>
 *          sets the action sequence ACTION_KEY defined in the plugin files for 
 *          the skill
 *      <force:Number>
 *          sets the force for the skill (multiplied by Force Base)
 * 
 * Event
 *      <enemy:id>, <actor:id>
 *          add this in an Event "comment" command to specify the enemy / actor
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
 * @desc Base force that is multiplied by each action's specified force. 
 * @type number
 * @decimals 2
 * @min 0.1
 * @max 5
 * @default 0.2
*/

import "./battlers/Game_Item";
import "./battlers/Game_BattlerBase";
import "./battlers/Game_Battler";
import "./battlers/Game_Actor";
import "./characters/Game_CharacterBase";
import "./characters/Game_Character";
import "./characters/Game_Player";
import "./characters/Game_Event";
import "./Game_Map";
import "./sprites/Sprite_BattlerParameters";
import "./sprites/Sprite_CharacterWeapon";
import "./action-sequences/action-sequences";

export default {
    EVENT_TAG_REGEX_ACTOR_ID: /\<actor:(\d+)\>/i,
    EVENT_TAG_REGEX_ENEMY_ID: /\<enemy:(\d+)\>/i,
    GAUGE_HEIGHT: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Gauge Height"]),
    BASE_FORCE: Number(PluginManager.parameters('MatterActionBattleSystem')["Force Base"]),
};