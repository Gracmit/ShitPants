const games = new Map();

export const gameStore = {
    create(state) {
        const id = generateId();
        state = {...state, id: id};
        games.set(id, state);
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
    },
    remove(id) {
        games.delete(id);
    }
};

const generateId = () => {
    const keys = Array.from(games.keys());
    if(keys.length === 0) return 1;
    return keys[keys.length - 1] + 1;
}