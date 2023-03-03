/* eslint-disable max-len */
/* eslint-disable no-console */
require("dotenv").config();
const express = require("express");
const firebaseAdmin = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");

const TelegramBot = require("node-telegram-bot-api");
const serviceAccount = require("../serviceAccountKey.json");
const TRANSLATIONS = require("./translations");

firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert({
    ...serviceAccount,
    client_id: process.env.FIREBASE_CLIENT_ID,
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.FIREBASE_REALTIME_URL,
});

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const app = express();
const db = firebaseAdmin.database();
const openai = new OpenAIApi(configuration);
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
const telegramGroupId = process.env.TELEGRAM_GROUP_ID;

const STATIC_USERS_DATA = {};

app.use(express.json());
app.get("/_health", (_, res) => {
  res.sendStatus(200);
});

const selectLanguage = (chatId) => {
  bot.sendMessage(chatId, "Please select your language:", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "EN", callback_data: "en" },
          { text: "UA", callback_data: "ua" },
          { text: "BY", callback_data: "by" },
          { text: "FR", callback_data: "fr" },
          { text: "ES", callback_data: "es" },
        ],
      ],
    },
  });
};

const subscribeRequest = (chatId, userLanguage) => {
  const { subscribeMessage, joinGroupMessage, checkMembershipMessage } =
    TRANSLATIONS[userLanguage];
  bot.sendMessage(chatId, subscribeMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: joinGroupMessage,
            url: "https://t.me/ai_doctor_community",
          },
          {
            text: checkMembershipMessage,
            callback_data: "check_membership",
          },
        ],
      ],
    },
  });
};

bot.on("message", async (msg) => {
  const usersDataRef = db.ref("usersData");
  const getUsersIDs = await usersDataRef.get();
  const usersIDs = await getUsersIDs.val();
  const isGroupMember = await bot
    .getChatMember(telegramGroupId, msg.chat.id)
    .then(
      (chatMember) =>
        chatMember?.status === "member" ||
        chatMember?.status === "creator" ||
        chatMember?.status === "administrator"
    );
  // ----------- // ------------ //

  const chatId = msg.chat.id;
  const userData = usersIDs?.[chatId];
  const existedUser = STATIC_USERS_DATA[chatId];
  const userLanguage =
    userData?.selectedLanguage || (existedUser && existedUser.selectedLanguage);

  const {
    exampleMessage = "",
    worningMessage = "",
    waitingMessage = "",
    additionalQuestionMessage = "",
  } = TRANSLATIONS[userLanguage] || {};

  if (msg.text === "/start") {
    if (!userData?.telegramData) {
      const telegramData = msg.from;
      usersDataRef.child(chatId).set({
        telegramData,
      });
      selectLanguage(chatId);
    } else {
      bot.sendMessage(chatId, exampleMessage).then(() => {
        bot.sendMessage(chatId, worningMessage);
      });
    }
  } else if (msg.text === "/changelanguage") {
    selectLanguage(chatId);
  } else if (!isGroupMember) {
    subscribeRequest(chatId, userLanguage);
  } else {
    bot.sendMessage(chatId, waitingMessage).then(async (sentMessage) => {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `${additionalQuestionMessage} "${msg.text}"`,
        max_tokens: 1200,
        temperature: 0,
      });
      const message = response.data.choices[0].text;
      bot.sendMessage(chatId, message);
      bot.deleteMessage(chatId, sentMessage.message_id);
      usersDataRef
        .child(chatId)
        .child("questions")
        .update({
          [msg.message_id]: {
            question: msg.text,
            answer: message,
          },
        });
    });
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const usersDataRef = db.ref("usersData");
  const getUsersIDs = await usersDataRef.get();
  const usersIDs = await getUsersIDs.val();
  const reply = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const userData = usersIDs?.[chatId];
  const userLanguage =
    userData?.selectedLanguage || STATIC_USERS_DATA?.[chatId]?.selectedLanguage;
  const {
    exampleMessage = "",
    nonMemberMessage = "",
    subscribedMessage = "",
  } = TRANSLATIONS[userLanguage] || {};

  function saveUserLanguage(language) {
    usersDataRef.child(chatId).update({
      selectedLanguage: language,
    });
    STATIC_USERS_DATA[chatId] = {
      selectedLanguage: language,
    };
  }

  if (["en", "ua", "fr", "es", "by"].includes(reply)) {
    bot.deleteMessage(chatId, messageId);
    saveUserLanguage(reply);
    bot.sendMessage(chatId, TRANSLATIONS[reply].welcomeMessege).then(() => {
      bot.sendMessage(chatId, TRANSLATIONS[reply].worningMessage).then(() => {
        bot.sendMessage(chatId, TRANSLATIONS[reply].exampleMessage);
      });
    });
  } else if (reply === "check_membership") {
    bot
      .getChatMember(telegramGroupId, chatId)
      .then((chatMember) => {
        if (
          chatMember.status === "member" ||
          chatMember.status === "creator" ||
          chatMember.status === "administrator"
        ) {
          bot.sendMessage(chatId, `${subscribedMessage}\n\n${exampleMessage}`);
          bot.deleteMessage(chatId, messageId);
        } else {
          bot.answerCallbackQuery(callbackQuery.id, {
            text: nonMemberMessage,
          });
        }
      })
      .catch((error) => {
        console.error(`Error checking user membership: ${error}`);
      });
  }
});

const server = app.listen(process.env.PORT, () => {
  console.log("Express server is live");
  bot.startPolling();
});

bot.on("polling_error", (error) => {
  console.log("Received ETELEGRAM error with message:", error.message);
  bot.stopPolling();
  server.close();
});
