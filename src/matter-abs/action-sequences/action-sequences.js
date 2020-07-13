import { times } from "lodash";
import { WEAPON_POSES } from "../weapon-poses";
import { adjustFrames, convertActionSequencesToCommands } from "./utils";
import "../characters/Game_Character";

const { 
    ANIMATION_SELF,
    ANIMATION_WEAPON,
    APPLY_EFFECT,
    CREATE_PROJECTILE,
    MOVEMENT_RESTRICT_OFF,
    MOVEMENT_RESTRICT_ON,
    ROUTE_CHANGE_BLEND_MODE,
    ROUTE_DIR_FIX_ON: DIR_FIX_ON,
    ROUTE_DIR_FIX_OFF: DIR_FIX_OFF,
    ROUTE_MOVE_BACKWARD: MOVE_BACKWARD,
    ROUTE_MOVE_FORWARD: MOVE_FORWARD,
    ROUTE_PLAY_SE, 
    ROUTE_THROUGH_ON: THROUGH_ON,
    ROUTE_THROUGH_OFF: THROUGH_OFF,
    ROUTE_TURN_90D_R: TURN_90D_R,
    ROUTE_TURN_180D: TURN_180D,
    STEP_BACKWARD,
    STEP_FORWARD, 
    STEP_LOCK, 
    STEP_NEUTRAL, 
    WEAPON_POSE,
} = Game_Character;

const command = (code, ...parameters) => ({ code, parameters });
const playSe = (name, volume = 90, pitch = 100) => command(ROUTE_PLAY_SE, { name, volume, pitch });
const animationSelf = (animationId, rotateWithCharacter) => command(ANIMATION_SELF, animationId, rotateWithCharacter);
const animationWeapon = (animationId, rotateWithCharacter) => command(ANIMATION_WEAPON, animationId, rotateWithCharacter);
const animationMagic = animationSelf(20);
const stepLock = lock => command(STEP_LOCK, lock); 
const weaponPose = pose => command(WEAPON_POSE, pose);
const n = (command, n) => times(n, () => command);
const setBlendMode = blendMode => command(ROUTE_CHANGE_BLEND_MODE, blendMode);

const FORWARD_SWING = {
    1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
    7: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.MID_SWING), animationSelf(11, true) ],
    12: [ STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING), APPLY_EFFECT ],
    25: [],
};

const BACK_SWING = {
    1: [ stepLock(true), STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING) ],
    7: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.MID_SWING), APPLY_EFFECT, animationSelf(26, true) ],
    12: [ STEP_FORWARD, weaponPose(WEAPON_POSES.UP_SWING) ],
    25: [],
};

const ACTION_SEQUENCES = {
    DEFAULT: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        25: [ STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        60: [],
    },
    FORWARD_SWING,
    BACK_SWING,
    TRIPLE_SLASH: {
        ...FORWARD_SWING,
        ...adjustFrames(BACK_SWING, 12),
        ...adjustFrames(FORWARD_SWING, 25),
        31: n(MOVE_FORWARD, 10),
        65: [],
    },
    // FLAT_BLADE: {
    //     1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE), animationSelf(29) ],
    //     25: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.MID_SWING), playSe('Wind7', 90, 70) ],
    //     27: [ STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
    //     45: [],
    // },
    RIPOSTE: {
        1: [ stepLock(true), STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING) ],
        7: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.MID_SWING), APPLY_EFFECT, playSe('Wind7', 90, 60) ],
        12: [ STEP_FORWARD, weaponPose(WEAPON_POSES.UP_SWING) ],
        25: [],
    },
    FAST_BLADE: {
        1: [ DIR_FIX_ON, stepLock(true), STEP_FORWARD, ...n(MOVE_FORWARD, 30), playSe('Flash2', 90, 150), weaponPose(WEAPON_POSES.DOWN_SWING) ],
        5: APPLY_EFFECT,
        10: [ STEP_BACKWARD, weaponPose(WEAPON_POSES.SIDE) ],
        30: [],
    },
    DEFLECT: {
        1: [ stepLock(true), STEP_BACKWARD, MOVE_BACKWARD, weaponPose(WEAPON_POSES.RAISE), DIR_FIX_ON ],
        60: [],
    },
    GUARD: {
        0: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.GUARD), APPLY_EFFECT ],
        1: [],
    },
    DODGE: {
        1: [ TURN_180D, DIR_FIX_ON, stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.IDLE), ...n(MOVE_BACKWARD, 15), playSe('Absorb1', 90, 150) ],
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
        45: [], 
    },
    IMP_ATTACK: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        6: animationWeapon(19),
        15: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        22: [ STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING) ],
        45: [], 
    },
    DASH_ATTACK: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        10: [ playSe('Flash2', 90, 150), THROUGH_ON, ...n(MOVE_FORWARD, 60) ],
        11: [ THROUGH_OFF, APPLY_EFFECT ]
    },
    CLIMHAZZARD: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.GUARD), animationSelf(5) ],
        30: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.RAISE) ],
        44: playSe('Thunder1'),
        45: [ ...n(MOVE_FORWARD, 2), STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT, animationWeapon(12) ],
        90: [],
    },
    FIRE: {
        1: [ stepLock(true), STEP_FORWARD, weaponPose(WEAPON_POSES.GUARD) ],
        10: [ STEP_BACKWARD, weaponPose(WEAPON_POSES.IDLE), CREATE_PROJECTILE, playSe('Fire1') ],
        30: []
    },
    THROW: {
        1: [ stepLock(true), STEP_FORWARD, weaponPose(WEAPON_POSES.GUARD) ],
        10: [ STEP_BACKWARD, weaponPose(WEAPON_POSES.IDLE), CREATE_PROJECTILE, playSe('Wind7', 90, 150) ],
        15: []
    },
    SPELL: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE), animationMagic ],
        10: [ STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        60: []
    },
    SPINNING_SLASH: {
        // turn 1
        1: [ stepLock(true), STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND) ],
        6: [ MOVEMENT_RESTRICT_OFF, DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON, playSe('Wind2', 90, 150), animationWeapon(21, true) ],
        9: [ DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON, APPLY_EFFECT ],
        12: [ DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON, animationWeapon(21, true) ],
        15: [ DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON ],
        // turn 2
        18: [ DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON, APPLY_EFFECT, animationWeapon(21, true) ],
        21: [ DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON ],
        24: [ DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON, animationWeapon(21, true) ],
        27: [ DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON, MOVEMENT_RESTRICT_ON ],
        45: [],
    },
};

export default convertActionSequencesToCommands(ACTION_SEQUENCES);