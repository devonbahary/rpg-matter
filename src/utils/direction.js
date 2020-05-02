/*
    7   8   9
    4       6
    1   2   3
*/

export const isUp = dir => [ 7, 8, 9 ].includes(dir);
export const isRight = dir => [ 3, 6, 9 ].includes(dir);
export const isDown = dir => [ 1, 2, 3].includes(dir);
export const isLeft = dir => [ 1, 4, 7].includes(dir);