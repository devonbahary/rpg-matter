export const getPartsFromBodies = bodies => bodies.reduce((acc, body) => [ ...acc, ...body.parts ], []);