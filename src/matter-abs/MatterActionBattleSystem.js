//=============================================================================
// MatterActionBattleSystem
//=============================================================================

/*:
 * @plugindesc Action Battle System
 * Requires MatterCore.js plugin.
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
*/

import "./battlers/Game_BattlerBase";
import "./battlers/Game_Battler";
import "./battlers/Game_Actor";
import "./characters/Game_CharacterBase";
import "./characters/Game_Character";
import "./characters/Game_Player";
import "./characters/Game_Event";
import "./sprites/Sprite_BattlerParameters";
import "./sprites/Sprite_CharacterWeapon";
import "./action-sequences";

export const MATTER_ABS = {
    EVENT_TAG_REGEX_ACTOR_ID: /\<Actor (\d+)\>/i,
    EVENT_TAG_REGEX_ENEMY_ID: /\<Enemy (\d+)\>/i,
    GAUGE_HEIGHT: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Gauge Height"]),
};