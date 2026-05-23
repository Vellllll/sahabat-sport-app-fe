// lib/auth.ts

export function isTokenExpired(token: string | undefined | null): boolean {
    if (!token) return true;

    try {
        // JWT berbentuk: header.payload.signature
        const arrayToken = token.split('.');
        if (arrayToken.length !== 3) return true;

        // Decode base64 payload
        const payload = JSON.parse(atob(arrayToken[1]));
        if (!payload.exp) return false;

        // Bandingkan waktu 'exp' (detik) dengan waktu sekarang (detik)
        const now = Math.floor(Date.now() / 1000);
        return payload.exp < now;
    } catch {
        return true; // Jika gagal decode, anggap expired demi keamanan
    }
}