import { times } from "lodash";
import { WEAPON_POSES } from "../weapon-poses";
import { convertActionSequencesToCommands } from "./utils";
import "../characters/Game_Character";

const { 
    ANIMATION_SELF,
    ANIMATION_WEAPON,
    APPLY_EFFECT,
    CREATE_PROJECTILE,
    ROUTE_CHANGE_BLEND_MODE,
    ROUTE_DIR_FIX_ON,
    ROUTE_MOVE_BACKWARD,
    ROUTE_MOVE_FORWARD,
    ROUTE_PLAY_SE, 
    ROUTE_THROUGH_OFF,
    ROUTE_THROUGH_ON,
    ROUTE_TURN_180D,
    STEP_BACKWARD,
    STEP_FORWARD, 
    STEP_LOCK, 
    STEP_NEUTRAL, 
    WEAPON_POSE,
} = Game_Character;

const command = (code, ...parameters) => ({ code, parameters });
const playSe = (name, volume = 90, pitch = 100) => command(ROUTE_PLAY_SE, { name, volume, pitch });
const animationSelf = animationId => command(ANIMATION_SELF, animationId);
const animationWeapon = animationId => command(ANIMATION_WEAPON, animationId);
const stepLock = lock => command(STEP_LOCK, lock); 
const weaponPose = pose => command(WEAPON_POSE, pose);
const n = (command, n) => times(n, () => command);
const setBlendMode = blendMode => command(ROUTE_CHANGE_BLEND_MODE, blendMode);

const ACTION_SEQUENCES = {
    DEFAULT: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        25: [ STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        60: [],
    },
    DEFLECT: {
        1: [ stepLock(true), STEP_BACKWARD, ROUTE_MOVE_BACKWARD, weaponPose(WEAPON_POSES.RAISE), ROUTE_DIR_FIX_ON ],
        60: [],
    },
    GUARD: {
        0: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.GUARD), APPLY_EFFECT ],
        1: [],
    },
    DODGE: {
        1: [ ROUTE_TURN_180D, ROUTE_DIR_FIX_ON, stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.IDLE), ...n(ROUTE_MOVE_BACKWARD, 15), playSe('Absorb1', 90, 150) ],
        30: [],
    },
    BOOST: {
        0: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.GUARD), playSe('Powerup', 90, 150) ],
        1: APPLY_EFFECT,
        15: [],
    },
    GOBLIN_ATTACK: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        15: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        22: [ STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING) ],
        60: [], 
    },
    SWING: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        7: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.EXTEND), animationWeapon(11) ],
        12: [ STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING), APPLY_EFFECT ],
        25: [],
    },
    DASH_ATTACK: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        10: [ playSe('Flash2', 90, 150), ROUTE_THROUGH_ON, ...n(ROUTE_MOVE_FORWARD, 60) ],
        11: [ ROUTE_THROUGH_OFF, APPLY_EFFECT ]
    },
    POWER_ATTACK: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.GUARD), animationSelf(5) ],
        30: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.RAISE) ],
        38: [ animationWeapon(12) ],
        45: [ ...n(ROUTE_MOVE_FORWARD, 5), STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        44: playSe('Thunder1'),
        90: [],
    },
    FIRE: {
        1: [ stepLock(true), STEP_FORWARD, weaponPose(WEAPON_POSES.GUARD) ],
        10: [ STEP_BACKWARD, weaponPose(WEAPON_POSES.IDLE), CREATE_PROJECTILE, playSe('Fire1') ],
        30: []
    },
    SPELL: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        10: [ STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        60: []
    },
};

export default convertActionSequencesToCommands(ACTION_SEQUENCES);