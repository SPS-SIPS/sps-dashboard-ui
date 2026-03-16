export const generateLocalId = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 6;

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    const randomPart = Array.from(array, (x) => chars[x % chars.length]).join("");
    const timestamp = Date.now().toString(36).toUpperCase();

    return `${timestamp}${randomPart}`;
};