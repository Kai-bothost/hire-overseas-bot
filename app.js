const { App } = require("@slack/bolt");
require("dotenv").config();
const http = require("http");

function createApp() {
  return new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    socketMode: true,
    appToken: process.env.SLACK_APP_TOKEN,
    clientOptions: {
      retryConfig: {
        retries: 10,
        factor: 2,
        minTimeout: 1000,
        maxTimeout: 60000,
      },
    },
  });
}

const NOTION_LINK =
  "https://www.notion.so/hireoverseas/Time-In-Out-Policy-Step-by-Step-Guide-2aeeb907ec1e801282d5fc463ac439b1";

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

function registerEvents(app) {
  app.event("member_joined_channel", async ({ event, client, logger }) => {
    const { user: userId } = event;

    try {
      const info = await client.users.info({ user: userId });
      if (info.user.is_bot) return;
    } catch (err) {
      logger.error("Could not fetch user info:", err.message);
      return;
    }

    try {
      await client.chat.postMessage({
        channel: userId,
        text: `Welcome to Hire Overseas, <@${userId}>! 🎉`,
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: randomOpener(), emoji: true },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `Hey there, <@${userId}>! 👋\n\nWelcome to the *Hire Overseas* team! We're *really* excited to have you on board and can't wait to see the amazing things you'll bring to the table. 🙌`,
            },
          },
          { type: "divider" },
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
              text: `🎯 *Fren Sagum — Head of Recruitment*\nGot referrals or questions about the hiring process? She's your go-to!\n\n🤝 *James G — Head of Client Management*\nAnything client-related — coordination, communication, feedback — goes through him.\n\n⚙️ *JB — Head of Operations*\nYour go-to for day-to-day support, coaching, issues, or leave approvals.`,
            },
          },
          { type: "divider" },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `📖 *Please read this important policy guide:*\n<${NOTION_LINK}|Time In/Out Policy — Step-by-Step Guide>`,
            },
          },
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "If you're ever unsure who to contact, message your designated Operations Manager. Welcome aboard! 🚀",
            },
          },
        ],
      });
    } catch (err) {
      logger.error("Failed to DM new member:", err.message);
    }
  });
}

async function startBot() {
  const app = createApp();
  registerEvents(app);

  try {
    await app.start();
    console.log("🤖 Hire Overseas Welcome Bot is live and ready!");
    console.log("Now connected to Slack");
  } catch (err) {
    console.error("Failed to start bot, retrying in 10 seconds...", err.message);
    setTimeout(startBot, 10000);
    return;
  }

  // Auto-restart if Slack disconnects
  app.error(async (err) => {
    console.error("Bot encountered an error, restarting in 10 seconds:", err.message);
    try {
      await app.stop();
    } catch (_) {}
    setTimeout(startBot, 10000);
  });
}

// Health check server for Railway
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running!");
}).listen(PORT, () => {
  console.log(`Health check server running on port ${PORT}`);
});

startBot();
