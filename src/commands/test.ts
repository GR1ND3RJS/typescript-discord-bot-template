import { CommandFile } from "../types";


export = {
    type: 'slash',
    command: {
        name: 'test',
        description: 'Test Command'
    },
    group: 'Misc',
    callback: (interaction, data) => {
        interaction.reply('Hello world!');
    },
} as CommandFile.FileOptions;