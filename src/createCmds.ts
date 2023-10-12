import Discord, { ApplicationCommandData } from 'discord.js'
import readCommands from './readCmds';
import { server_id } from '../config.json';
import { CommandFile } from './types';


export default async function createCmds(client: Discord.Client) {
    const files = await readCommands();
    const commands: ApplicationCommandData[] = []

    const commandFiles = files.filter((file): file is CommandFile.SlashCommand | CommandFile.UserCommand | CommandFile.MessageCommand => 'command' in file);

    commandFiles.forEach((file) => {
        if(file.command) {
            commands.push(file.command);
        }
    });

    




    ;(async () => {
        try {
            console.log('Started refreshing application (/) commands.');
            const guild = await client.guilds.fetch(server_id)
            //await client.application?.commands.set(commands) //set global commands
            await guild.commands.set(commands);

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
}