export const adjustFrames = (actionSequence, byFrames) => {
    return Object.entries(actionSequence).reduce((acc, [ frame, commands ]) => {
        acc[parseInt(frame) + byFrames] = commands;
        return acc;
    }, {});
};

export const convertActionSequencesToCommands = actionSequences => {
    return Object.entries(actionSequences).reduce((acc, [ ACTION_SEQ_KEY, SEQUENCE ]) => {
        acc[ACTION_SEQ_KEY] = Object.entries(SEQUENCE).reduce((acc, [ frame, commands ]) => {
            // convert each defined frame as an array of commands if not already
            if (!Array.isArray(commands)) commands = [ commands ];

            // convert each command into a command object if not already
            acc[frame] = commands.map(command => {
                if (typeof command === 'object') return command;
                
                return {
                    code: command,
                    parameters: [],
                };
            });

            return acc;
        }, {})
        return acc;
    }, {});
};