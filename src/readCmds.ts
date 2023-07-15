import path from 'path';
import fs from 'fs';
import Discord from 'discord.js';
import { CommandFile } from './types';
// import runCmds from './runCmds';

export default async function readCmds(): Promise<CommandFile.FileOptions[]> {

    const interactions: CommandFile.FileOptions[] = [];


    function readDir(directory: string) {
        const files = fs.readdirSync(path.join(__dirname, directory))
        for (const file of files) {
            const stat = fs.lstatSync(path.join(__dirname, directory, file))
            if (stat.isDirectory()) {
                readDir(path.join(directory, file));
            } else {
                const fileData = fs.readFileSync(path.join(__dirname, directory, file)).toString();
                if (fileData.includes('CommandFile.FileOptions') || fileData.includes('CommandFile.FileOptions;')) {
                    const option = require(path.join(__dirname, directory, file))
                    interactions.push(option);
                }
            }
        }
    }

    readDir('./commands');

    return interactions;
}