/**
 * Optional live-AI integration point (disabled by default).
 *
 * Enable ONLY with an Austere-owned, approved Chatbase TEST agent:
 *   PUBLIC_CHATBASE_AGENT_ID=<agent id> npm run build
 *
 * - The agent id is a public embed identifier, not a secret. Never put API
 *   keys in frontend code or environment variables prefixed with PUBLIC_.
 * - The script is injected only after the visitor explicitly chooses
 *   "Live AI test" in the guide panel.
 * - The agent must be trained only on AI_EMPLOYEE_KNOWLEDGE_SEED content and
 *   display the concept disclaimer.
 */
export const CHATBASE_AGENT_ID: string | undefined = import.meta.env.PUBLIC_CHATBASE_AGENT_ID || undefined;

export const LIVE_AI_DISCLAIMER =
  "Independent Austere concept demo, not Universal Hardware's official customer service. Answers come from public website information and may be wrong; nothing is sent to Universal Hardware.";

let loading: Promise<void> | null = null;

export function loadChatbase(agentId: string): Promise<void> {
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://www.chatbase.co/embed.min.js';
    s.id = agentId;
    s.setAttribute('domain', 'www.chatbase.co');
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Chatbase widget failed to load'));
    document.body.appendChild(s);
  });
  return loading;
}
