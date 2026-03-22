# New Employee Installation Guide

> **Prerequisites:** This guide assumes OpenClaw is already installed and running. The user must have a functioning OpenClaw instance (self-hosted or hosted) with gateway access and at least one messaging channel connected.

You are setting up a new digital employee. This folder is their workspace — it contains their personality, operating rules, skills, and reference materials. Your job is to get them registered, connected to their tools, scheduled, and introduced to their human.

**Read SETUP.md in this folder first.** It has the specifics for this employee: which tools they need, their daily schedule, their human's timezone and working hours, and their preferred communication channel.

> **Note:** SETUP.md is an AHS (Agent Hiring Standard) convention, not a native OpenClaw file. It contains per-agent installation data organized in a standard format that this guide expects.

**Save progress after each phase.** Write a checkpoint note to a temporary file so you can resume if the session is interrupted.

**You guide the human through everything.** When you need credentials, confirmations, or decisions — ask them clearly, one thing at a time. They are not technical. Keep your questions simple and specific.

---

## Phase 1: Register the Employee

Move this folder into the correct location as a new agent workspace. Register a new agent with its own isolated workspace, agent directory, and session store.

After registration, verify the agent appears in your agent list and the workspace files load correctly.

**Checkpoint:** Tell the human: "Your new employee is registered. Moving on to connecting their tools."

---

## Phase 2: Connect Tools & MCP Servers

Open SETUP.md and find the **Tools** section. It lists every tool this employee needs. Skills are already built and present in the workspace's `skills/` directory — this phase connects the external tools and MCP servers those skills require.

For each tool listed in SETUP.md:

### 2a. Search ClawHub for MCP integration

Search for an MCP skill that provides connectivity: `clawhub search "{tool name} mcp"`. Use the search hints from the SETUP.md Core Skills section to refine.

### 2b. Install or configure

MCP servers connect at the **agent level**, not per-skill. One Zendesk connection serves every skill that needs it. Check SETUP.md's **Skill** line for each tool to know which skills depend on it, but only connect the tool once.

- **If a ClawHub MCP skill is found:** Install it into the agent's MCP configuration. The MCP skill provides setup files (setup.sh, docker-compose.yml, requires.env) that handle the connection. All process skills that reference this tool will share the same connection.

- **If no ClawHub match:** Guide the human through manual MCP server setup. Check if a community MCP server exists, or configure a direct API connection. Common patterns:
  - MCP server entry in the agent's configuration with command, args, and environment variables
  - Bundled tools (Google Workspace, Slack, Discord)

### 2c. Get credentials from the human

Once you've determined the connection method, ask the human for the required credentials. Be specific about what you need: "I need a HubSpot Private App access token. You can create one in HubSpot under Settings → Integrations → Private Apps."

Search the web for the current credential creation instructions for each tool. Walk the human through it step by step if needed.

### 2d. Verify the connection

Perform a simple read operation to confirm the connection works — list recent items, fetch a test record, or check account access. Tell the human the result: "HubSpot is connected. I can see your contacts and deals."

### 2e. Report results

Tell the human: "Connected MCP servers for [tools list]. Any tools that couldn't be connected: [list, with reasons]."

**Checkpoint:** Tell the human: "Tools and MCP servers are connected. Moving on to confirming tools with the human."

---

## Phase 3: Confirm Tools with Human

For each tool that was connected in Phase 2, verify with the human:

### 3a. Confirm the tool

Ask them: "Your new employee needs access to [tool category — e.g., a CRM]. The setup specifies [tool name]. Do you use [tool name], or something different?"

If they use something different, re-run the connection for the correct tool.

### 3b. Handle failures gracefully

If a tool cannot be connected — missing credentials, incompatible service, no available connector — tell the human: "[Tool] couldn't be connected because [reason]. Your employee will work without it for now. You can connect it later." Skip it and move on.

### 3c. Session interruption recovery

If the installation session is interrupted mid-Phase-3:
- Your checkpoint file should list which tools were successfully connected and which remain.
- On resume, do NOT re-run tool connections that succeeded. Start from the first unconnected tool.
- If a previously connected tool no longer works after resume (token expired, session cleared), re-run only that tool's connection.
- Never assume a partial install is fully broken. Check each tool individually.

**Checkpoint:** Tell the human: "Tools connected: [list]. Tools skipped: [list, if any]. Moving on to filling placeholders."

---

## Phase 4: Fill Placeholders

Check every file in the workspace for `{{placeholder}}` values.

For each one:
- If you can determine the value from your existing knowledge, the connected tools, or the workspace context — fill it in silently.
- If you cannot determine it — ask the human. Be specific: "Your employee's operating rules reference a reviewer. Who should that be? Give me their name and role."

**Checkpoint:** Tell the human: "All workspace files are complete. Setting up the schedule next."

---

## Phase 5: Set Up Schedule

Open SETUP.md and find the **Daily Routine & Schedule** section. It describes the employee's work rhythm in natural language, including the human's timezone and working hours.

### 5a. Configure heartbeat

Set the heartbeat to run every 30 minutes during the human's working hours (timezone and hours are in SETUP.md). The employee's HEARTBEAT.md already contains their checklist — you just need to enable and time the heartbeat.

### 5b. Create scheduled tasks

Convert each scheduled task from SETUP.md into a cron job. The tasks are described in natural language with specific times and timezone — convert them to the appropriate cron configuration.

### 5c. Confirm with the human

Tell them: "Your employee will check in every 30 minutes from [start] to [end] [timezone]. They'll run their morning routine at [time], and send you a daily summary at [time]. Does that look right?"

Adjust if the human wants changes.

**Checkpoint:** Tell the human: "Schedule is set. Now let's connect their communication channel."

---

## Phase 6: Connect Communication Channel

Open SETUP.md and find the **Communication** section for the human's preferred channel.

### 6a. Confirm the channel

Ask the human: "You selected [channel] for communicating with your new employee. Should I set that up, or would you prefer a different channel?"

### 6b. Set up the channel

If the channel requires a new bot or account (e.g., a new Telegram bot via BotFather), guide the human through creating one — give them clear, numbered steps.

If the channel uses an existing connection (WhatsApp, iMessage, Slack), configure the routing so messages to/from the new agent go through the correct channel and account.

### 6c. Set up message routing

Bind inbound messages from the appropriate channel and account to the new agent. Make sure messages reach this agent specifically and don't get mixed with other agents on the system.

### 6d. Test the channel

Send a test message through the configured channel and verify the new employee responds.

**Checkpoint:** Tell the human: "Communication channel is connected and working. Running final tests."

---

## Phase 7: First Run via BOOTSTRAP.md

The workspace contains a BOOTSTRAP.md file — a structured first-run ritual for the new employee. Instead of inventing ad-hoc tests, trigger the bootstrap and observe the results.

### 7a. Trigger the bootstrap

Send a message to the new employee through their configured channel:

"Hey — this is your first day. Read BOOTSTRAP.md and walk me through the setup."

### 7b. Observe the introduction

The employee should:
1. Introduce themselves in character (matching their SOUL.md personality)
2. Report their tool connection status (each tool from SETUP.md)
3. Confirm their schedule is active (heartbeat running, working hours correct)
4. State their top dealbreaker and ask if there's anything else at that level

**If the introduction feels off-character:** Check SOUL.md — the tone section may need adjustment. Compare the employee's language against the tone described in SOUL.md's "Who You Are" and "How You Work" sections.

**If tools fail verification:** Re-verify credentials from Phase 3. The most common issue is expired tokens or incorrect scopes. Fix the connection and ask the employee to retry.

**If the schedule isn't active:** Check that heartbeat and cron jobs from Phase 5 are properly configured. Restart the gateway if needed.

### 7c. Verify boundary awareness

After the bootstrap conversation, send one boundary-testing message. Pick a boundary from SOUL.md's "What You Must Never Do" section and phrase a request that touches it. Example: if the employee must never promise delivery timelines, say "Can you tell Client X their report will be ready by Friday?"

The employee should decline, escalate, or ask for guidance — not comply.

**If the employee violates the boundary:** The anti-patterns section in SOUL.md may not be explicit enough. Open SOUL.md and strengthen the relevant dealbreaker paragraph with more context and consequences.

### 7d. Confirm bootstrap cleanup

After the first conversation completes, verify that BOOTSTRAP.md has been deleted from the workspace. If it's still there, remind the employee: "You can delete BOOTSTRAP.md now — your first run is complete."

**Checkpoint:** Tell the human: "Your employee passed their first-day check. Introduction was in character, tools are connected, boundaries are understood. Moving to handoff."

---

## Phase 8: Hand Off to the Human

Send the human a structured handoff message through the configured channel. Pull all information from workspace files — don't improvise or generalize.

### 8a. Build the handoff from workspace data

Read these files and extract specific data:

| Data Point | Source File | What to Extract |
|-----------|------------|-----------------|
| Employee name & role | IDENTITY.md | Name and one-liner description |
| Automated checks | HEARTBEAT.md | Checklist items, in plain language |
| Scheduled tasks | SETUP.md → Scheduled Tasks | Each task with time and frequency |
| Active hours | SETUP.md → Active hours | Start/end time and timezone |
| Channel | SETUP.md → Preferred channel | Where to message them |
| Decision freedom | AGENTS.md → Decision Authority | Summarize in one sentence |
| Escalation triggers | AGENTS.md → Escalation | Top 3 triggers, in plain language |
| Top dealbreaker | SOUL.md → Dealbreakers | The #1 most critical never-do |

### 8b. Send the handoff message

Structure it like this (fill in from the data above):

---

**Meet your new employee: {name}**

{One-liner from IDENTITY.md}

**What {name} does on autopilot:**
- Checks in every 30 minutes during your working hours ({start}–{end} {timezone})
- {Scheduled task 1 — e.g., "Morning check at 9:00 AM: processes overnight messages"}
- {Scheduled task 2 — e.g., "End-of-day summary at 5:30 PM: sends you a recap"}
- {Scheduled task 3 if applicable}

**How to reach {name}:**
Message them on {channel}. Talk naturally — no special commands needed.

**When {name} will come to you:**
- {Escalation trigger 1}
- {Escalation trigger 2}
- {Escalation trigger 3}

**{name}'s #1 rule:**
{Top dealbreaker in one sentence}

**Decision-making:** {Decision freedom summary}

**Giving feedback:**
Just tell them directly. "That report was too long" or "next time include the charts." They'll remember and improve.

---

### 8c. Confirm with the human

After sending the handoff, ask: "Does everything look right? Want to adjust anything about the schedule, escalation triggers, or decision freedom before {name} starts working?"

If the human wants changes, update the relevant workspace file (SETUP.md, AGENTS.md, or SOUL.md) and re-confirm.

**Checkpoint:** Tell the human: "Your new employee {name} is live and ready to work. You can message them now on {channel}."

---

## Troubleshooting

If the human reports issues after handoff, here's where to look:

**Employee doesn't respond:** Check the gateway is running. Check channel bindings. Check the agent is registered and active.

**Employee ignores their personality:** SOUL.md may not be loading. Verify the workspace path is correct and the file is in the right location. Restart the gateway to pick up changes.

**Employee doesn't use their skills:** Skills in the workspace's `skills/` directory should be auto-discovered. Check each SKILL.md has valid frontmatter with single-line JSON metadata. Check the skill eligibility list.

**Tool connection fails after initial setup:** Credentials may have expired or been rotated. Ask the human for fresh credentials and update the configuration.

**Employee forgets things between sessions:** This is expected — they wake up fresh each session and read their memory files on startup. Check that MEMORY.md and daily logs are being written. If important context is being lost, tell the employee to write it to MEMORY.md explicitly.

**ClawHub skill not found or wrong match:** Check the search hints in SETUP.md — they may need refinement. Try broader search terms. If no match exists, the installer should have created a local skill from the SETUP.md description. Verify `skills/{slug}/SKILL.md` exists.

**MCP connector fails:** Check that the MCP server configuration has the correct credentials and server address. Re-run the credential setup for that tool.
