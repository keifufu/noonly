export default function randomToken(length: number) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  for (var i = 0, n = charset.length, token = ''; i < length; ++i) {
    token += charset.charAt(Math.floor(Math.random() * n))
  }
  return token
}