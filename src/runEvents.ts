import Discord, { Client, ClientEvents } from 'discord.js';
import { CommandFile } from './types';
import readEvents from './readEvents';

type EventCat = {
    name: keyof ClientEvents;
    events: CommandFile.EventOptions<keyof ClientEvents>[];
};
export default async function(client: Client) {
    const events = await readEvents();

    let eventCategory: EventCat[] = [];

    for(const event of events) {
        if(eventCategory.find(f => f.name === event.name)) {
            eventCategory.find(f => f.name === event.name).events.push(event)
        } else {
            eventCategory.push({
                name: event.name,
                events: [event],
            })
        }
    }



    for(const category of eventCategory) {
        client.on(category.name, (...args) => {
            category.events.forEach((event) => event.callback(client, ...args))
        });
    }
}