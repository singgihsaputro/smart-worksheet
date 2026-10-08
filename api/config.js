// GET: the public settings the page needs. The OAuth client id is not a secret.
// No database here, so it answers even before Turso is set up.
export function GET() {
  return Response.json({ googleClientId: process.env.GOOGLE_CLIENT_ID ?? null })
}
