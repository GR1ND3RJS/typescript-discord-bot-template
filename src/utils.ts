import Discord, { ActionRow, ActionRowBuilder, ButtonBuilder, Channel, ChannelSelectMenuBuilder, ChannelType, Client, ColorResolvable, Embed, EmbedBuilder, GuildMember, MentionableSelectMenuBuilder, MessageCreateOptions, MessagePayload, ModalBuilder, PermissionFlags, PermissionFlagsBits, PermissionsString, RoleSelectMenuBuilder, StringSelectMenuBuilder, TextChannel, TextInputBuilder, UserSelectMenuBuilder, } from 'discord.js';
import { server_id, channels, roles, colors, members } from '../config.json';
import { client } from '..';
import fs from 'fs';
import path from 'path';
import { PermissionLevel } from './types';
const mediaDir = './src/media';

type EmbedOptions = {
    description: string;
    title?: string;
    color: ColorResolvable | 'Main';
    footer?: string;
    footerImage?: string;
    author?: string;
    authorImage?: string;
}

interface ComponentOptions {
    button: ButtonBuilder;
    stringmenu: StringSelectMenuBuilder;
    rolemenu: RoleSelectMenuBuilder;
    channelmenu: ChannelSelectMenuBuilder;
    usermenu: UserSelectMenuBuilder;
    mentionablemenu: MentionableSelectMenuBuilder;
    textInput: TextInputBuilder;
}

type PermissionMessage = {
    success: true;
} | {
    success: false;
    permissionsMissing: PermissionsString[];
}

export interface UtilData {
    evaluateMemberPermissions(member: GuildMember, permissions: PermissionsString[] | PermissionsString): PermissionMessage;
    evaluateMemberRoles(member: GuildMember, roles: string[] | string): boolean;
    evaluateMemberState(member: GuildMember): PermissionLevel;
    createInfoEmbed(description: string, color?: ColorResolvable): EmbedBuilder;
    createDmEmbed(options: EmbedOptions): EmbedBuilder;
    logMessageRaw(options: MessageCreateOptions): Promise<void>;
    createRow<K extends keyof ComponentOptions>(type: K, components: (ComponentOptions[K])[]): ActionRowBuilder<ComponentOptions[K]>;
    evaluateChannelType(channel: Channel): string;
    colors: {
        [key: string]: string;
    };
    getImage(imageName: string): Discord.RawFile | undefined;
    getVideo(videoName: string): Discord.RawFile | undefined;
}


const Utils : UtilData = {
    getImage: (imageName) => {
        const picDir = `${mediaDir}/pic/${imageName}`;

        const file = fs.readFileSync(picDir);

        if(!file) {
            return undefined;
        }

        const rawFile: Discord.RawFile = {
            data: picDir,
            name: imageName,
        }
        return rawFile
    },
    getVideo: (videoName) => {
        const vidDir = `${mediaDir}/vid/${videoName}`;

        const file = fs.readFileSync(vidDir);

        if(!file) {
            return undefined;
        }

        const rawFile: Discord.RawFile = {
            data: vidDir,
            name: videoName,
        }

        return rawFile;
    },
    logMessageRaw: async (options) => {
        const channelId: string = channels.log;

        const guild = await client.guilds.fetch(server_id)

        const logChannel = await guild.channels.fetch(channelId) as TextChannel;

        await logChannel.send(options);
    },
    evaluateMemberState: (member) => {
        // 'Public' | 'Booster' | 'Staff' | 'Admin' | 'Owner'| 'Developer'; 
        let memberLevel: PermissionLevel = 'Public';


        if(member.premiumSince !== undefined) {
            memberLevel = 'Booster';
        }

        if(member.roles.cache.has(roles.staff)) {
            memberLevel = 'Staff';
        }


        if(member.roles.cache.has(roles.admin)) {
            memberLevel = 'Admin';
        }

        if(member.guild.ownerId === member.user.id) {
            memberLevel = 'Owner';
        }

        if(member.user.id === members.dev) {
            memberLevel = "Developer";
        }

        return memberLevel;
    },
    evaluateMemberPermissions: (member, p) => {
        if(typeof p === 'string') {
            p = [p];
        }

        if(!p) return {
            success: true
        }

        let bool = true;
        let missingPerms: PermissionsString[] = []
        for(const perm of p) {
            if(!member.permissions.has(perm)) {
                bool = false;
                missingPerms.push(perm);
            }
        }
        if(bool) {
            return {
                success: true
            }
        } else {
            return {
                success: false,
                permissionsMissing: missingPerms,
            }
        }
    },
    evaluateMemberRoles: (member, r) => {
        if(typeof r === "string") {
            r = [r];
        }

        if(!r) return true;

        let bool = true;

        for(const role of r) {
            if(!member.roles.cache.has(role)) {
                bool = false;
            }
        }

        return bool;
    },
    createInfoEmbed: (description, color) => {
        const embed = new EmbedBuilder()
        .setDescription(description)
        .setColor(color || colors.primary as ColorResolvable);

        return embed;
    },
    createDmEmbed: ({description, color, author, authorImage, footer, footerImage, title}) => {
        const embed = new EmbedBuilder()
        .setDescription(description)
        .setColor('Blurple');

        if(title) {
            embed.setTitle(title);
        }
        if(color) {
            if(color === "Main") {
                embed.setColor(colors.primary as ColorResolvable)
            } else {
                embed.setColor(color)
            }
        }
        if(footer) {
            embed.setFooter({ text: footer, iconURL: footerImage || undefined,})
        }
        if(author) {
            embed.setAuthor({ name: author, iconURL: authorImage || undefined})
        }

        return embed;
    },
    colors: {
        primary: colors.primary,
        accent: colors.accent,
        success: colors.success,
        error: colors.error,
        danger: colors.danger,
    },
    createRow: (type, components) => {
        const row = new ActionRowBuilder<ComponentOptions[typeof type]>()
        .setComponents(components);

        return row;
    },
    evaluateChannelType: (channel) => {
        let result = 'None';
        if(channel.isTextBased()) {
            result = `Text: `

            if(channel.isVoiceBased()) {
                result = `Voice: `
            }

            if(channel.type == ChannelType.GuildText) {
                result += `Guild Text`
            }
            if(channel.type == ChannelType.PublicThread) {
                result += `Guild Public Thread`
            }
            if(channel.type == ChannelType.PrivateThread) {
                result += `Guild Private Thread`
            }
            if(channel.type == ChannelType.DM) {
                result += `DM`
            }
            if(channel.type == ChannelType.GuildAnnouncement) {
                result += `Guild Announcement`
            }
            if(channel.type == ChannelType.GuildVoice) {
                result += `Guild Voice`
            }
            if(channel.type == ChannelType.AnnouncementThread) {
                result += `Guild Announcement: Thread`
            }
            if(channel.type == ChannelType.GuildStageVoice) {
                result += `Guild Stage Voice`
            }
        } else {
            result = `Misc: `
            if(channel.type == ChannelType.GuildCategory) {
                result += `Guild Category`
            }
            if(channel.type == ChannelType.GroupDM) {
                result += `Group DM`
            }
            if(channel.type == ChannelType.GuildForum) {
                result += `Guild Forum`
            }
        }

        return result;
    }
}


export default Utils;