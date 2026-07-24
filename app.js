const { App } = require("@slack/bolt");
require("dotenv").config();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

const NOTION_LINK =
  "https://www.notion.so/hireoverseas/Time-In-Out-Policy-Step-by-Step-Guide-2aeeb907ec1e801282d5fc463ac439b1";

const SURVEY_LINK =
  "https://docs.google.com/forms/d/1miN3jimGp97T9XsgtEHLRie24VexmyFlyVEXX2lrUMA/edit?ts=69f381f0";

// Kai's Slack user ID — logs will be sent here
const ADMIN_USER_ID = "U098Q3ECFUG";

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
  let userInfo;
  try {
    userInfo = await client.users.info({ user: userId });
    if (userInfo.user.is_bot) return;
  } catch (err) {
    logger.error("Could not fetch user info:", err.message);
    return;
  }

  const userName =
    userInfo.user.profile.real_name ||
    userInfo.user.profile.display_name ||
    userInfo.user.name;

  const now = new Date().toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    dateStyle: "medium",
    timeStyle: "short",
  });

  // ── Message 1: Welcome DM ──────────────────────────────
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
            text: `Hey there, <@${userId}>! 👋\n\nWelcome to the *Hire Overseas* team! We're *really* excited to have you on board and can't wait to see the amazing things you'll bring to the table. You're going to fit right in. 🙌`,
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
            text: `🎯 *Fren Sagum — Head of Recruitment*\nGot referrals or questions about the hiring process? She's your go-to!`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `⚙️ *JB — Head of Operations*\nDay-to-day support, coaching, issues, leave approvals — basically your operations lifeline.`,
          },
        },
        { type: "divider" },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `📖 *Before you dive in, give this a read:*\n<${NOTION_LINK}|⏰ Time In/Out Policy — Step-by-Step Guide>\nIt'll take 5 minutes and save you a lot of questions later. Promise!`,
          },
        },
        { type: "divider" },
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
    logger.info(`✅ Welcome DM sent to ${userName}`);
  } catch (err) {
    logger.error(`❌ Failed to send welcome DM:`, err.message);
  }

  // ── Message 2: Survey reminder (sent 3 days later) ─────
  try {
    const threeDaysFromNow = Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60;
    await client.chat.scheduleMessage({
      channel: userId,
      post_at: threeDaysFromNow,
      text: `📋 Hey <@${userId}>! Just a quick reminder — please fill out this survey after your first 3 days with the client:\n\n${SURVEY_LINK}\n\nIt only takes a few minutes and helps us make sure everything is going well for you! 🙌`,
    });
    logger.info(`✅ Survey reminder scheduled for ${userName}`);
  } catch (err) {
    logger.error(`❌ Failed to schedule survey reminder:`, err.message);
  }

  // ── Message 3: Log to Kai's DM ─────────────────────────
  try {
    await client.chat.postMessage({
      channel: ADMIN_USER_ID,
      text: `🤖 *Bot Log*\n✅ *${now}* — Welcome DM sent to *${userName}*\n📋 Survey reminder scheduled for 3 days from now.`,
    });
    logger.info(`✅ Log sent to Kai for ${userName}`);
  } catch (err) {
    logger.error(`❌ Failed to send log to Kai:`, err.message);
  }
});

(async () => {
  await app.start();
  console.log("🤖 Hire Overseas Welcome Bot is live and ready!");
})();
