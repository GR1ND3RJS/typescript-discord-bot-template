import Discord, { ApplicationCommandData, ChatInputCommandInteraction, ChatInputApplicationCommandData, PermissionsString, AutocompleteInteraction, UserApplicationCommandData, MessageApplicationCommandData, UserContextMenuCommandInteraction, ButtonInteraction, ModalSubmitInteraction, StringSelectMenuInteraction, RoleSelectMenuInteraction, UserSelectMenuInteraction, ChannelSelectMenuInteraction, MentionableSelectMenuInteraction, MessageContextMenuCommandInteraction, CacheType, Events, ClientEvents, Client } from 'discord.js'
import { UtilData } from './utils';
import { GroupNames } from '..';

export type Interactions = Discord.CommandInteraction<Discord.CacheType> | Discord.ButtonInteraction<Discord.CacheType> | Discord.ModalSubmitInteraction<Discord.CacheType> | Discord.StringSelectMenuInteraction<Discord.CacheType> | Discord.RoleSelectMenuInteraction<Discord.CacheType> | Discord.UserSelectMenuInteraction<Discord.CacheType>  | Discord.MentionableSelectMenuInteraction<Discord.CacheType> | Discord.AnySelectMenuInteraction<Discord.CacheType>;


export type PermissionLevel = 'Public' | 'Booster' | 'Staff' | 'Admin' | 'Owner'| 'Developer'; 


export namespace CommandFile {
    interface BaseDiscordInteraction {
        group: GroupNames;
        cooldown?: number;
        defer?: boolean;
        ephemeral?: boolean;
        permissionLevel?: PermissionLevel;
        permissions?: PermissionsString[];
    }

    interface DiscordDropdown extends BaseDiscordInteraction {
        type: "dropdown";
        name: string;
    }

    export interface SlashCommand extends BaseDiscordInteraction {
        type: "slash";
        command: ChatInputApplicationCommandData;
        callback: (interaction: ChatInputCommandInteraction<Discord.CacheType>, options: UtilData) => void;
        autoComplete?: (interaction: AutocompleteInteraction<Discord.CacheType>, options: UtilData) => Discord.ApplicationCommandOptionChoiceData<string | number>[] | Promise<Discord.ApplicationCommandOptionChoiceData<string | number>[]>;
    }

    export interface UserCommand extends BaseDiscordInteraction {
        type: "userContext";
        command: UserApplicationCommandData;
        callback: (interaction: UserContextMenuCommandInteraction<Discord.CacheType>, options: UtilData) => void;
    }

    export interface MessageCommand extends BaseDiscordInteraction {
        type: "messageContext";
        command: MessageApplicationCommandData;
        callback: (interaction: MessageContextMenuCommandInteraction<CacheType>, options: UtilData) => void;
    }

    export interface DiscordButton extends BaseDiscordInteraction {
        type: "button";
        name: string;
        callback: (interaction: ButtonInteraction<CacheType>, options: UtilData) => void;
    }

    export interface DiscordModal extends BaseDiscordInteraction {
        type: "modal";
        name: string;
        callback: (interaction: ModalSubmitInteraction<CacheType>, options: UtilData) => void;
    }

    

    export interface StringDropDown extends DiscordDropdown {
        menuType: 'string';
        callback: (interaction: StringSelectMenuInteraction, options: UtilData) => void;
    }
    export interface RoleDropDown extends DiscordDropdown {
        menuType: 'role';
        callback: (interaction: RoleSelectMenuInteraction, options: UtilData) => void;
    }
    export interface UserDropDown extends DiscordDropdown {
        menuType: 'user';
        callback: (interaction: UserSelectMenuInteraction, options: UtilData) => void;
    }
    export interface ChannelDropDown extends DiscordDropdown {
        menuType: 'channel';
        callback: (interaction: ChannelSelectMenuInteraction, options: UtilData) => void;
    }
    export interface MentionableDropDown extends DiscordDropdown {
        menuType: 'mentionable';
        callback: (interaction: MentionableSelectMenuInteraction, options: UtilData) => void;
    }

    export type AnyMenu = StringDropDown | RoleDropDown | UserDropDown | ChannelDropDown | MentionableDropDown;

    export type EventOptions<T extends keyof Discord.ClientEvents> = {
        name: T;
        callback(client: Client, ...options: Discord.ClientEvents[T]): void | Promise<void>
    }

    export type InteractionOptions = SlashCommand | UserCommand | MessageCommand | DiscordButton | DiscordModal
    | AnyMenu;
}


