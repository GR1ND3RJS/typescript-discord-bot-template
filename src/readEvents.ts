import path from 'path';
import fs from 'fs';
import Discord, { ClientEvents } from 'discord.js';
import { CommandFile } from './types';
// import runCmds from './runCmds';



export default async function readEvents(): Promise<CommandFile.EventOptions<keyof ClientEvents>[]> {

    const FileOptions: CommandFile.EventOptions<keyof ClientEvents>[] = [];


    function readDir(directory: string) {
        const files = fs.readdirSync(path.join(__dirname, directory))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, directory, file))
            if (stat.isDirectory()) {
                readDir(path.join(directory, file));
            } else {
                const fileData = fs.readFileSync(path.join(__dirname, directory, file)).toString();
                if (fileData.includes('CommandFile.EventOptions') || fileData.includes('CommandFile.EventOptions;')) {
                    const option = require(path.join(__dirname, directory, file))
                    FileOptions.push(option);
                }
            }
        }
    }

    readDir(`./events`);

    return FileOptions;
}