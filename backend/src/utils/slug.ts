
// Fallback for CommonJS: use a simple random string generator
export function generateSlug(length = 6): string {
    const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let slug = '';
    for (let i = 0; i < length; i++) {
        slug += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return slug;
}
