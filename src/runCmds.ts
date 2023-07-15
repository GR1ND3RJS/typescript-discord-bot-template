import Discord, { ApplicationCommandType, Client, CommandInteraction, EmbedBuilder, GuildMember, MessageContextMenuCommandInteraction } from 'discord.js';
import { UtilData } from './utils';
import { Interactions, CommandFile } from './types';
import Utils from './utils';


type CoolDown = { [key: string]: EpochTimeStamp; };

const cooldowns: CoolDown = {};




/** Common MiddleWare for interaction commands such as `Slash Commands`, `User Context Menu Commands`, and `Message Context Menu Commands`.
* 
*
*
*/
async function commandMiddleWare(interaction: Discord.ChatInputCommandInteraction | Discord.MessageContextMenuCommandInteraction | Discord.UserContextMenuCommandInteraction, command: CommandFile.UserCommand | CommandFile.SlashCommand | CommandFile.MessageCommand | undefined): Promise<boolean> {

    if(!command) {
        interaction.reply({
            embeds: [
                Utils.createInfoEmbed(`The command ${interaction.commandName} is not yet configured. Ask the dev to fix it!`)
            ],
            ephemeral: true,
        });

        return false;
    }

    // CHECK IF NOT UNDEFINED ^^

    if(!Utils.evaluateMemberPermissions(await interaction.guild.members.fetch(interaction.member.user.id), command.permissions)) {
        interaction.reply({
            embeds: [
                Utils.createInfoEmbed(`Unfortanately, you do not have the permissions to use this command.`)
            ]
        });
        return;
    }

    // PERMISSIONS ^^

    if(command.cooldown || command.cooldown > 0) {
        const seconds = 1000 * command.cooldown;

        if(cooldowns[interaction.user.id] !== null) {

            const timestamp = cooldowns[interaction.user.id];

            const difference = Math.floor((new Date().getTime() - timestamp) / 1000); // In Seconds
            

            interaction.reply({
                embeds: [
                    Utils.createInfoEmbed(`Sorry, but you still have a ${seconds} second cooldown for this command. You will be able to use this command in ${difference} seconds.`)
                ]
            });

            return;
        } else {
            cooldowns[interaction.user.id] = new Date().getTime();
            setTimeout(() => {
                delete cooldowns[interaction.user.id];
            });
        }
    }

    // COOLDOWN ^^

    if(command.defer) {
        await interaction.deferReply();
    }

    return true; // Whether or not the command can run
}


async function interactionMiddleware(interaction: Exclude<Interactions, CommandInteraction>, command: CommandFile.FileOptions): Promise<boolean> {
    if(!Utils.evaluateMemberPermissions(await interaction.guild.members.fetch(interaction.member.user.id), command.permissions)) {
        interaction.reply({
            embeds: [
                Utils.createInfoEmbed(`Unfortanately, you do not have the permissions to use this command.`)
            ]
        });
        return;
    }

    // PERMISSIONS ^^

    if(command.cooldown || command.cooldown > 0) {
        const seconds = 1000 * command.cooldown;

        if(cooldowns[interaction.user.id] !== null) {

            const timestamp = cooldowns[interaction.user.id];

            const difference = Math.floor((new Date().getTime() - timestamp) / 1000); // In Seconds
            

            interaction.reply({
                embeds: [
                    Utils.createInfoEmbed(`Sorry, but you still have a ${seconds} second cooldown for this command. You will be able to use this command in ${difference} seconds.`)
                ]
            });

            return;
        } else {
            cooldowns[interaction.user.id] = new Date().getTime();
            setTimeout(() => {
                delete cooldowns[interaction.user.id];
            });
        }
    }

    // COOLDOWN ^^

    if(command.defer) {
        await interaction.deferReply();
    }

    return true
}


const DiscordInteractionEmbed: EmbedBuilder = Utils.createInfoEmbed(`This interaction is not yet configured. Ask the dev to fix it!`)



export default function runCommand(client: Client, options: CommandFile.FileOptions[]) {

    console.log(`Started, no issues!`)


    client.on('interactionCreate', async interaction => {

        if(interaction.isAutocomplete()) {
            const name = interaction.commandName;

            const commands = options.filter((option): option is CommandFile.SlashCommand => 'command' in option);

            const command = commands.find(cmd => cmd.command.name === name && cmd.autoComplete);

            if(command) {
                const response = await command.autoComplete(interaction, Utils);

                response.forEach((r, i) => {
                    if(r.name.length > 25) {
                        response[i].name = r.name.slice(0, 25);
                    }
                });

                interaction.respond(response);
            } else {
                interaction.respond([{
                    name: 'Error - Not Configured :/',
                    value: "Not set up"
                }])
            }
        }
        
        if(interaction.isCommand()) {
            const name = interaction.commandName;

            const baseCmds = options.filter((option): option is CommandFile.UserCommand | CommandFile.SlashCommand | CommandFile.MessageCommand  => {
                if('command' in option) {
                    return true;
                } else {
                    return false;
                }
            });

            const cmds = baseCmds.filter(option => option.command.name === name);


            let command: CommandFile.UserCommand | CommandFile.SlashCommand | CommandFile.MessageCommand | undefined;
            
            if(interaction.isChatInputCommand()) {
                command = cmds.find((cmd): cmd is CommandFile.SlashCommand => cmd.type === 'slash');

                if(!await commandMiddleWare(interaction, command) || !command) {
                    return;
                }

                command.callback(interaction, Utils);
            } else if(interaction.isUserContextMenuCommand()) {
                command = cmds.find((cmd): cmd is CommandFile.UserCommand => cmd.type === 'userContext');

                if(!await commandMiddleWare(interaction, command) || !command) {
                    return;
                }
                command.callback(interaction, Utils);
            } else if(interaction.isMessageContextMenuCommand()) {
                command = cmds.find((cmd): cmd is CommandFile.MessageCommand => cmd.type === 'messageContext');

                if(!await commandMiddleWare(interaction, command) || !command) {
                    return;
                }
                command.callback(interaction, Utils);
            }

        } else if(interaction.isButton()) {
            const name = interaction.customId;

            const baseButtons = options.filter((option): option is CommandFile.DiscordButton => {
                if(option.type === "button" ) {
                    return true;
                } else {
                    return false;
                }
            });

            const button = baseButtons.find(option => option.name === name);

            if(!await interactionMiddleware(interaction, button) || !button) {
                return;
            }

            button.callback(interaction, Utils);
        } else if(interaction.isAnySelectMenu()) {
            const name = interaction.customId;
            const baseMenus = options.filter((option): option is CommandFile.AnyMenu => 'menuType' in option);

            const menus = baseMenus.filter(menu => menu.name === name);

            let menu: CommandFile.AnyMenu;
            if(interaction.isStringSelectMenu()) {
                menu = menus.find(m => m.menuType === 'string') as CommandFile.StringDropDown;

                if(!await interactionMiddleware(interaction, menu) || !menu) {
                    return;
                }

                menu.callback(interaction, Utils);
                
            } else if(interaction.isRoleSelectMenu()) {
                menu = menus.find(m => m.menuType === 'role') as CommandFile.RoleDropDown;

                if(!await interactionMiddleware(interaction, menu) || !menu) {
                    return;
                }

                menu.callback(interaction, Utils);
                
            } else if(interaction.isChannelSelectMenu()) {
                menu = menus.find(m => m.menuType === 'channel') as CommandFile.ChannelDropDown;

                if(!await interactionMiddleware(interaction, menu) || !menu) {
                    return;
                }

                menu.callback(interaction, Utils);
                
            } else if(interaction.isUserSelectMenu()) {
                menu = menus.find(m => m.menuType === 'user') as CommandFile.UserDropDown;

                if(!await interactionMiddleware(interaction, menu) || !menu) {
                    return;
                }

                menu.callback(interaction, Utils);
                
            } else if(interaction.isMentionableSelectMenu()) {
                menu = menus.find(m => m.menuType === 'mentionable') as CommandFile.MentionableDropDown;

                if(!await interactionMiddleware(interaction, menu) || !menu) {
                    return;
                }

                menu.callback(interaction, Utils);
                
            }
        } else if(interaction.isModalSubmit()) {
            const name = interaction.customId;
            const baseModals = options.filter((option): option is CommandFile.DiscordModal => option.type === 'modal');

            const modal = baseModals.find(modal => modal.name === name);

            if(!await interactionMiddleware(interaction, modal) ||!modal) {
                return;
            }

            modal.callback(interaction, Utils);
        }
    })
}