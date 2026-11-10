// Switches set from the hosting environment (Vercel → Settings → Environment Variables).
// NEXT_PUBLIC_SUPPORT_ENABLED=false hides Help & support from customers; anything else shows it.
export const SUPPORT_ENABLED = process.env.NEXT_PUBLIC_SUPPORT_ENABLED !== "false";
