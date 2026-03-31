const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

// Team member Slack IDs
const TEAM = {
  fren:  "U0AEE3BAJAK",
  james: "U08QAS6EMUM",
  jb:    "U0888KTTC91",
};

const NOTION_LINK =
  "https://www.notion.so/hireoverseas/Time-In-Out-Policy-Step-by-Step-Guide-2aeeb907ec1e801282d5fc463ac439b1";

// Fun rotating openers
const OPENERS = [
  "🎉 A new legend has entered the chat!",
  "🚀 Houston, we have a new teammate!",
  "🎊 The team just got a whole lot better!",
  "⭐ Someone awesome just joined the crew!",
  "🙌 Big things are coming — and so are you!",
];

function randomOpener() {
  return OPENERS[Math.floor(Math.random() * OPENERS.length)];
}

app.event("member_joined_channel", async ({ event, client, logger }) => {
  const { user: userId } = event;

  // Skip bots
  try {
    const info = await client.users.info({ user: userId });
    if (info.user.is_bot) return;
  } catch (err) {
    logger.error("Could not fetch user info:", err.message);
    return;
  }

  try {
    await client.chat.postMessage({
      channel: userId, // DM directly to the new user
      text: `Welcome to Hire Overseas, <@${userId}>! 🎉`, // fallback text
      blocks: [
        // ── Header banner ──────────────────────────────────────
        {
          type: "header",
          text: {
            type: "plain_text",
            text: randomOpener(),
            emoji: true,
          },
        },

        // ── Welcome message ─────────────────────────────────────
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Hey there, <@${userId}>! 👋\n\nWelcome to the *Hire Overseas* team! We're *really* excited to have you on board and can't wait to see the amazing things you'll bring to the table. You're going to fit right in. 🙌`,
          },
        },

        { type: "divider" },

        // ── Key people ──────────────────────────────────────────
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Here's your cheat sheet on the key people you'll be working with:* 📋",
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🎯 *<@${TEAM.fren}> — Head of Recruitment*\nGot referrals or questions about the hiring process? She's your go-to!`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `🤝 *<@${TEAM.james}> — Head of Client Management*\nAll things client — coordination, communication, feedback. He's got it covered.`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `⚙️ *<@${TEAM.jb}> — Head of Operations*\nDay-to-day support, coaching, issues, leave approvals — basically your operations lifeline.`,
          },
        },

        { type: "divider" },

        // ── Notion link ─────────────────────────────────────────
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `📖 *Before you dive in, give this a read:*\n<${NOTION_LINK}|⏰ Time In/Out Policy — Step-by-Step Guide>\nIt'll take 5 minutes and save you a lot of questions later. Promise!`,
          },
        },

        { type: "divider" },

        // ── Footer ──────────────────────────────────────────────
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "💬 *Not sure who to contact?* Just message your designated Operations Manager and they'll point you in the right direction. Welcome aboard — we're glad you're here! 🌏",
            },
          ],
        },
      ],
    });

    logger.info(`✅ Welcome DM sent to ${userId}`);
  } catch (error) {
    logger.error(`❌ Failed to send welcome DM to ${userId}:`, error.message);
  }
});

(async () => {
  await app.start();
  console.log("🤖 Hire Overseas Welcome Bot is live and ready!");
})();
