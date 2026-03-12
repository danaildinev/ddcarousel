import type { CarouselEvents } from "../types/event.types";

export class Events {
    #events = new Map<string, Set<(payload: any) => void>>(); //unique used events

    reset = () => this.#events.clear();

    // call with typed events (CarouselEvents) or with custom/no event
    on<K extends keyof CarouselEvents>(name: K, callback: (payload: CarouselEvents[K]) => void): void;
    on(name: string, callback: (payload?: any) => void): void;
    on(name: string, callback: (payload?: any) => void): void {
        let handlers = this.#events.get(name);

        if (!handlers) {
            handlers = new Set();
            this.#events.set(name, handlers);
        }

        handlers.add(callback);
    }

    emit<K extends keyof CarouselEvents>(name: K, payload: CarouselEvents[K]): void;
    emit(name: string, payload?: any): void;
    emit(name: string, payload?: any) {
        const callbacks = this.#events.get(name);
        if (!callbacks)
            return;

        callbacks.forEach(cb => cb(payload));
    }

    off<K extends keyof CarouselEvents>(name: K, callback: (payload: CarouselEvents[K]) => void): void;
    off(name: string, callback: (payload?: any) => void): void;
    off(name: string, callback: (payload?: any) => void) {
        const eventName = this.#events.get(name);
        if (eventName === undefined)
            throw Error(`Event name '${name}' is not found!`);

        eventName.delete(callback);
    }
}