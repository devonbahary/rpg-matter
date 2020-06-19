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
 * @param Latest Damage Duration
 * @parent Battler HUD
 * @desc Duration (in frames) of the damage portion of the HP gauge
 * @type number
 * @min 0
 * @default 30
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
 * 
 * @param Guard Animation
 * @parent Battler
 * @desc Animation ID for successful guard.
 * @type animation
 * 
 * @param Guard Screen Effect Multiplier
 * @parent Battler
 * @desc Multiplier for screen shake effects when the player takes damage while guarding.
 * @type number
 * @decimals 2
 * @default 0.5
 * @min 0
 * 
 * @param Actions
 * 
 * @param Default Weapon Force
 * @parent Actions
 * @type number
 * @desc The default force of a normal attack for a given weapon.
 * @min 0
 * @max 5
 * @decimals 2
 * @default 1
 * 
 * @param Default Ranges
 * @parent Actions
 * @desc The default range of actions (in tiles).
 * @type struct<ActionRanges>
 * 
 * @param Default Hit Stun
 * @parent Actions
 * @desc The default hit stun value for actions (in frames).
 * @type struct<ActionHitStuns>
 * 
 * @param Default Cooldowns
 * @parent Actions
 * @desc The default cooldowns for actions (in frames).
 * @type struct<ActionCooldowns>
 * 
 * @param Dodge Skill
 * @parent Battler
 * @type skill
 * @default 15
 * 
 * @param Deflect Skill
 * @parent Battler
 * @type skill
 * @desc Skill set on battler who is successfully guarded against, used to apply a "deflected" action sequence.
 * 
 * @param Critical Hit Stop
 * @parent Battler
 * @desc The frames of hit stop (visual effect pause between battlers) for a critical hit.
 * @type number
 * @default 30
 * 
 * @param Hit Stop Camera
 * @parent Battler
 * @desc Settings around the camera focus on a battler affected by hit stop.
 * @type struct<Zoom>
 * 
 * @param Hit Stop Time Scale
 * @parent Battler
 * @desc Time Scale multiplier for battlers involved in hit stop. Values < 0 produce a slow-mo effect.
 * @type number
 * @decimals 2
 * @default 0.1
 * 
 * @param Guard Cancel
 * @parent Battler
 * @desc Guard skill cancels actions by default. Use meta tag <canGuardCancel[:false]> for specific actions.
 * @type boolean
 * @default true
 * 
 * @param Actors
 * 
 * @param Default Actor Hit Stun Resist
 * @parent Actors
 * @desc Default hit stun resist for actors without meta tag <hitStunResist:Number>.
 * @type number
 * @default 0
 * @min 0
 * 
 * @param Hit Stun Resist Guard EtypeIds
 * @parent Actors
 * @desc List of EtypeIds which only contribute to actor Hit Stun Resist while guarding.
 * @type number[]
 * @default ["1","2"]
 *
 * @param Enemies
 * 
 * @param Default Enemy Hit Stun Resist
 * @parent Enemies
 * @desc Default hit stun resist for enemies without meta tag <hitStunResist:Number>.
 * @type number
 * @default 0
 * @min 0 
 * 
 * @param Battle
 * 
 * @param Allow Menu During Battle
 * @parent Battle
 * @desc Allow menu access while an enemy has aggro towards a party member.
 * @type boolean
 * @default true
 *
*/

/*~struct~ActionRanges:
 * @param Weapons
 * @type number
 * @decimals 2
 * @default 1
 * 
 * @param Skills
 * @type number
 * @decimals 2
 * @default 1
 * 
*/

/*~struct~ActionCooldowns:
 * @param Skills
 * @type number
 * @default 60
 * 
 * @param Items
 * @type number
 * @default 60
 * 
*/

/*~struct~ActionHitStuns:
 * @param Weapons
 * @type number
 * @default 10
 * 
 * @param Skills
 * @type number
 * @default 0
 * 
*/

/*~struct~Zoom:
 * @param Scale
 * @type number
 * @decimals 2
 * @default 1.1
 * 
 * @param Duration
 * @type number
 * @default 6
 * 
*/

import { constantCase } from "change-case";
import "./battlers/Game_Item";
import "./battlers/Game_ActionABS";
import "./battlers/Game_BattlerBase";
import "./battlers/Game_Battler";
import "./battlers/Game_Actor";
import "./battlers/Game_Enemy";
import "./units/Game_Unit";
import "./units/Game_Party";
import "./units/Game_TroopABS";
import "./characters/Game_CharacterBase";
import "./characters/Game_Character";
import "./characters/Game_Projectile";
import "./characters/Game_Player";
import "./characters/Game_Event";
import "./Game_Map";
import "./Game_Screen";
import "./scenes/Scene_Map";
import "./sprites/Sprite_Animation";
import "./sprites/Sprite_BattlerParameters";
import "./sprites/Sprite_CharacterWeapon";
import "./sprites/Sprite_Character";
import "./sprites/Spriteset_Map";
import "./windows/Window_Action_HUD";
import "./windows/Window_PlayerBattler";
import "./action-sequences/action-sequences";
import { transformPluginStruct } from "../utils";

const capitalizeKeyAndNumberValue = (acc, key, val) => {
    acc[constantCase(key)] = Number(val);
    return acc;
};

export default {
    GAUGE_HEIGHT: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Gauge Height"]),
    GAUGE_LATEST_DAMAGE_DURATION: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Latest Damage Duration"]),
    DEFAULT_HIT_STUN: transformPluginStruct(
        PluginManager.parameters('MatterActionBattleSystem')["Default Hit Stun"],
        capitalizeKeyAndNumberValue,
    ),
    DEFAULT_RANGES: transformPluginStruct(
        PluginManager.parameters('MatterActionBattleSystem')["Default Ranges"],
        capitalizeKeyAndNumberValue,
    ),
    DEFAULT_COOLDOWNS: transformPluginStruct(
        PluginManager.parameters('MatterActionBattleSystem')["Default Cooldowns"],
        capitalizeKeyAndNumberValue,
    ),
    DEFAULT_WEAPON_FORCE: Number(PluginManager.parameters('MatterActionBattleSystem')["Default Weapon Force"]),
    NORMAL_ATTACK_MISS_SE: {
        name: PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss SE"],
        volume: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss Volume"]),
        pitch: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Normal Attack Miss Pitch"]),
    },
    GUARD_ANIMATION_ID: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Guard Animation"]),
    GUARD_CANCEL_DEFAULT: JSON.parse(PluginManager.parameters('MatterActionBattleSystem')["Guard Cancel"]),
    GUARD_SCREEN_EFFECTS_MULT: Number(PluginManager.parameters('MatterActionBattleSystem')["Guard Screen Effect Multiplier"]),
    DEFLECT_SKILL_ID: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Deflect Skill"]),
    DODGE_SKILL_ID: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Dodge Skill"]),
    CRITICAL_HIT_STOP: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Critical Hit Stop"]),
    HIT_STOP_ZOOM: transformPluginStruct(
        PluginManager.parameters('MatterActionBattleSystem')["Hit Stop Camera"],
        capitalizeKeyAndNumberValue,
    ),
    HIT_STOP_TIME_SCALE: Number(PluginManager.parameters('MatterActionBattleSystem')["Hit Stop Time Scale"]),
    DEFAULT_ACTOR_HIT_STUN_RESIST: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Default Actor Hit Stun Resist"]),
    DEFAULT_ENEMY_HIT_STUN_RESIST: parseInt(PluginManager.parameters('MatterActionBattleSystem')["Default Enemy Hit Stun Resist"]),
    HIT_STUN_RESIST_GUARD_ONLY_ETYPE_IDS: JSON.parse(PluginManager.parameters('MatterActionBattleSystem')["Hit Stun Resist Guard EtypeIds"]).map(etypeId => Number(etypeId)),
    ALLOW_MENU_DURING_BATTLE: JSON.parse(PluginManager.parameters('MatterActionBattleSystem')["Allow Menu During Battle"]),
};