import { WEAPON_POSES } from "../weapon-poses";
import { 
    adjustFrames,
    animationSelf,
    animationWeapon,
    stepLock, 
    n,
    playSe,
    weaponPose,
} from "./utils";

const { 
    APPLY_EFFECT,
    MOVEMENT_RESTRICT_OFF,
    MOVEMENT_RESTRICT_ON,
    ROUTE_DIR_FIX_ON: DIR_FIX_ON,
    ROUTE_DIR_FIX_OFF: DIR_FIX_OFF,
    ROUTE_MOVE_FORWARD: MOVE_FORWARD,
    ROUTE_TURN_90D_R: TURN_90D_R,
    STEP_BACKWARD,
    STEP_FORWARD, 
    STEP_NEUTRAL, 
} = Game_Character;

const FORWARD_SWING = {
    1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
    7: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.MID_SWING), animationSelf(11, true), playSe('Wind7', 90, 80) ],
    12: [ STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING), APPLY_EFFECT ],
    25: [],
};

const BACK_SWING = {
    1: [ stepLock(true), STEP_FORWARD, weaponPose(WEAPON_POSES.DOWN_SWING) ],
    7: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.MID_SWING), APPLY_EFFECT, animationSelf(26, true) ],
    12: [ STEP_FORWARD, weaponPose(WEAPON_POSES.UP_SWING) ],
    25: [],
};

export default {
    SWORD: FORWARD_SWING,
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
    SPINNING_SLASH: {
        // turn 1
        1: [ stepLock(true), STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND) ],
        6: [ MOVEMENT_RESTRICT_OFF, TURN_90D_R, DIR_FIX_ON, playSe('Wind2', 90, 150), animationWeapon(21, true) ],
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
    TRIPLE_SLASH: {
        ...FORWARD_SWING,
        ...adjustFrames(BACK_SWING, 12),
        ...adjustFrames(FORWARD_SWING, 25),
        31: n(MOVE_FORWARD, 10),
        65: [],
    },
    COUP_DE_GRACE: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.DOWN_SWING), animationSelf(21, true), playSe('Sword4', 90, 150) ],
        4: [ STEP_NEUTRAL, TURN_90D_R, DIR_FIX_ON ],
        6: [ STEP_FORWARD, DIR_FIX_OFF, TURN_90D_R, DIR_FIX_ON, APPLY_EFFECT ],
        7: weaponPose(WEAPON_POSES.SIDE),
        40: [],
    },
};