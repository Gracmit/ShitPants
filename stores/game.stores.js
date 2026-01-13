const games = new Map();

export const gameStore = {
    create(state) {
        games.set(generateId(), state);
        return state;
    },
    get(id) {
        return games.get(id);
    },
    update(id, state) {
        games.set(id, state);
        return state;
    }
};

const generateId = () => {
    keys = games.keys();
    if(keys.length === 0) return 1;
    return keys[length - 1] + 1;
}