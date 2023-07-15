import Discord, { ActionRow, ActionRowBuilder, ButtonBuilder, Channel, ChannelSelectMenuBuilder, ChannelType, Client, ColorResolvable, Embed, EmbedBuilder, GuildMember, MentionableSelectMenuBuilder, MessageCreateOptions, MessagePayload, ModalBuilder, PermissionFlags, PermissionFlagsBits, PermissionsString, RoleSelectMenuBuilder, StringSelectMenuBuilder, TextChannel, TextInputBuilder, UserSelectMenuBuilder, } from 'discord.js';
import { server_id, channels, roles } from '../config.json';
import { client } from '..';

type EmbedOptions = {
    description: string;
    title?: string;
    color: 'Red' | 'Yellow' | 'Blurple' | 'Main';
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
    createInfoEmbed(description: string, color?: ColorResolvable): EmbedBuilder;
    createDmEmbed(options: EmbedOptions): EmbedBuilder;
    logMessageRaw(options: MessageCreateOptions): Promise<void>;
    createRow<K extends keyof ComponentOptions>(type: K, components: (ComponentOptions[K])[]): ActionRowBuilder<ComponentOptions[K]>;
    evaluateChannelType(channel: Channel): string;
    colors: {
        [key: string]: string;
    };
}


const Utils : UtilData = {
    logMessageRaw: async (options) => {
        const channelId: string = channels.log;

        const guild = await client.guilds.fetch(server_id)

        const logChannel = await guild.channels.fetch(channelId) as TextChannel;

        await logChannel.send(options);
    },
    evaluateMemberPermissions: (member, p) => {
        if(typeof p === 'string') {
            p = [p];
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
        .setColor(color || "Blurple");

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
                embed.setColor("Blurple")
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