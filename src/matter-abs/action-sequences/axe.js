import { animationSelf, jump, n, playSe, stepLock, weaponPose } from "./utils";
import { WEAPON_POSES } from "../weapon-poses";

const { 
    APPLY_EFFECT,
    ROUTE_DIR_FIX_ON: DIR_FIX_ON,
    ROUTE_DIR_FIX_OFF: DIR_FIX_OFF,
    ROUTE_MOVE_FORWARD: MOVE_FORWARD,
    ROUTE_MOVE_BACKWARD: MOVE_BACKWARD,
    ROUTE_MOVE_CHAR_L: MOVE_LEFT,
    ROUTE_MOVE_CHAR_R: MOVE_RIGHT,
    ROUTE_TURN_90D_L: TURN_90_L,
    ROUTE_TURN_90D_R: TURN_90_R,
    STEP_BACKWARD,
    STEP_FORWARD, 
    STEP_NEUTRAL, 
} = Game_Character;

export default {
    AXE: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        16: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.EXTEND), animationSelf(11, true), playSe('Wind7', 90, 60) ],
        18: [ STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING_AXE), APPLY_EFFECT ],
        35: [],
    },
    WILD_SWING: {
        1: [ stepLock(true), STEP_BACKWARD, TURN_90_L, weaponPose(WEAPON_POSES.EXTEND), animationSelf(33, true), playSe('Wind7', 90, 50), DIR_FIX_ON ],
        6: [ DIR_FIX_OFF, TURN_90_R, weaponPose(WEAPON_POSES.EXTEND), DIR_FIX_ON ],
        7: APPLY_EFFECT,
        8: [ weaponPose(WEAPON_POSES.SIDE) ],
        15: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON ],
        22: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON ],
        30: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON ],
        60: [],
    },
    MIGHTY_BLOW: {
        1: [ stepLock(true), STEP_BACKWARD, jump(5), MOVE_FORWARD, MOVE_FORWARD, weaponPose(WEAPON_POSES.EXTEND), playSe('Absorb1', 90, 150) ],
        2: [ MOVE_FORWARD, MOVE_FORWARD ],
        3: [ STEP_NEUTRAL, jump(10), MOVE_FORWARD, MOVE_FORWARD, weaponPose(WEAPON_POSES.RAISE) ],
        4: [ MOVE_FORWARD, MOVE_FORWARD ],
        5: [ jump(10), MOVE_FORWARD, MOVE_FORWARD ],
        6: [ MOVE_FORWARD, MOVE_FORWARD ],
        7: [ STEP_BACKWARD, MOVE_FORWARD, ],
        8: [ MOVE_FORWARD, MOVE_FORWARD ],
        9: [ MOVE_FORWARD, MOVE_FORWARD, animationSelf(36, true), playSe('Wind7', 90, 50) ],
        10: [ MOVE_FORWARD, MOVE_FORWARD ],
        11: [ MOVE_FORWARD, MOVE_FORWARD ],
        12: [ STEP_FORWARD, weaponPose(WEAPON_POSES.MID_SWING), MOVE_FORWARD, MOVE_FORWARD ],
        13: [ jump(-5), MOVE_FORWARD, MOVE_FORWARD ],
        14: [ jump(-7), MOVE_FORWARD, MOVE_FORWARD ],
        15: [ jump(-9), weaponPose(WEAPON_POSES.DOWN_SWING_AXE), MOVE_FORWARD, MOVE_FORWARD, APPLY_EFFECT, DIR_FIX_ON ],
        16: jump(-4),
        30: DIR_FIX_OFF,
        60: [],
    },
    MAILBREAKER: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.EXTEND), MOVE_FORWARD ],
        8: [ TURN_90_R, weaponPose(WEAPON_POSES.GUARD), DIR_FIX_ON, MOVE_LEFT ],
        16: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON, weaponPose(WEAPON_POSES.EXTEND), playSe('Wind7', 90, 50), MOVE_BACKWARD ],
        19: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON, MOVE_RIGHT ],
        22: [ DIR_FIX_OFF, TURN_90_R, DIR_FIX_ON, MOVE_FORWARD, APPLY_EFFECT, animationSelf(33, true) ],
        23: [ weaponPose(WEAPON_POSES.UP_SWING) ],
        90: []
    },
    EXECUTIONER: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        16: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.MID_SWING), animationSelf(11, true), playSe('Wind7', 90, 70) ],
        18: [ STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        35: [ STEP_NEUTRAL ],
        37: [ STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        60: [],
    },
};