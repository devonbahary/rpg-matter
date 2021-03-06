import "../characters/Game_Character";
import { WEAPON_POSES } from "../weapon-poses";
import { convertActionSequencesToCommands, jump, playSe, animationSelf, animationWeapon, n, stepLock, weaponPose } from "./utils";
import AXE from "./axe";
import DAGGER from "./dagger";
import SWORD from "./sword";

const { 
    APPLY_EFFECT,
    CREATE_PROJECTILE,
    MOVEMENT_RESTRICT_OFF,
    MOVEMENT_RESTRICT_ON,
    ROUTE_DIR_FIX_ON: DIR_FIX_ON,
    ROUTE_MOVE_BACKWARD: MOVE_BACKWARD,
    ROUTE_MOVE_FORWARD: MOVE_FORWARD,
    ROUTE_THROUGH_ON: THROUGH_ON,
    ROUTE_THROUGH_OFF: THROUGH_OFF,
    ROUTE_TURN_180D: TURN_180D,
    STEP_BACKWARD,
    STEP_FORWARD, 
    STEP_NEUTRAL, 
} = Game_Character;

const animationMagic = animationSelf(20);

const ACTION_SEQUENCES = {
    ...AXE,
    ...DAGGER,
    ...SWORD,
    DEFAULT: {
        1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE) ],
        25: [ STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
        60: [],
    },
    // FLAT_BLADE: {
    //     1: [ stepLock(true), STEP_BACKWARD, weaponPose(WEAPON_POSES.RAISE), animationSelf(29) ],
    //     25: [ STEP_NEUTRAL, weaponPose(WEAPON_POSES.MID_SWING), playSe('Wind7', 90, 70) ],
    //     27: [ STEP_FORWARD, weaponPose(WEAPON_POSES.EXTEND), APPLY_EFFECT ],
    //     45: [],
    // },
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
        15: [],
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
    STOMP: {
        1: [ stepLock(true), STEP_BACKWARD, jump(5), weaponPose(WEAPON_POSES.EXTEND), MOVEMENT_RESTRICT_OFF ],
        3: [ STEP_NEUTRAL, jump(10), weaponPose(WEAPON_POSES.RAISE) ],
        5: jump(10),
        7: [ STEP_BACKWARD ],
        12: [ STEP_FORWARD, weaponPose(WEAPON_POSES.GUARD) ],
        13: jump(-5),
        14: jump(-7),
        15: [ jump(-9), animationSelf(35), APPLY_EFFECT ],
        16: [ jump(-4), MOVEMENT_RESTRICT_ON ],
        60: [],
    },
    BULLRUSH: {
        0: weaponPose(WEAPON_POSES.GUARD),
        1: [ DIR_FIX_ON, MOVE_FORWARD, APPLY_EFFECT ],
        2: [ MOVE_FORWARD, animationSelf(34) ],
        3: MOVE_FORWARD,
        4: MOVE_FORWARD,
        5: MOVE_FORWARD,
        6: MOVE_FORWARD,
        7: MOVE_FORWARD,
        8: MOVE_FORWARD,
        9: MOVE_FORWARD,
        10: MOVE_FORWARD,
        10: MOVE_FORWARD,
        12: MOVE_FORWARD,
        13: MOVE_FORWARD,
        14: MOVE_FORWARD,
        15: MOVE_FORWARD,
    },
};

export default convertActionSequencesToCommands(ACTION_SEQUENCES);