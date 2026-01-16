const games = new Map();

export const gameStore = {
    create(state) {
        const id = generateId();
        games.set(id, state);
        state = {...state, id: id};
        return state;
    },
    get(id) {
        return games.get(id);
    },
    update(id, state) {
        games.set(id, state);
        return state;
    },
    getAll() {
        return Array.from(games.values());
    }
};

const generateId = () => {
    const keys = Array.from(games.keys());
    if(keys.length === 0) return 1;
    return keys[keys.length - 1] + 1;
}