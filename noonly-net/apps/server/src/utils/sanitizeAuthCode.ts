export const sanitizeAuthCode = (code: string) => code.replaceAll(' ', '').replaceAll('-', '')