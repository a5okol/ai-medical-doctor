/* eslint-disable indent */
/* eslint-disable no-undef */
/* eslint-disable no-console */
require("dotenv").config();
const express = require("express");

const TRANSLATIONS = require("./translations");
const bot = require("./services/telegramBotService");
const openaiRequest = require("./services/openaiService");
const { firebase } = require("./services/firebaseService");
const {
  STATIC_USERS_DATA,
  selectService,
  selectLanguage,
  subscribeRequest,
  getIsNonGroupMember,
} = require("./utils");

const app = express();
const db = firebase.database();
const telegramGroupId = process.env.TELEGRAM_GROUP_ID;

app.use(express.json());
app.get("/_health", (_, res) => {
  res.sendStatus(200);
});

const waitingForResponse = [];

bot.on("message", async (msg) => {
  if (String(msg.chat.id) === String(telegramGroupId)) {
    console.log("Message from group");
    return;
  }
  const chatId = msg.chat.id;
  const usersDataRef = db.ref("usersData");
  const getUsersIDs = await usersDataRef.get();
  const usersIDs = await getUsersIDs.val();
  const userData = usersIDs?.[chatId];
  const existedUser = STATIC_USERS_DATA[chatId];
  const userLanguage =
    userData?.selectedLanguage ||
    existedUser?.selectedLanguage ||
    msg.from.language_code;
  const {
    cancelMessage = "",
    worningMessage = "",
    exampleMessages: { dosage = "", diagnosis = "" } = {},
    service: {
      dosageMessage = "",
      serviceMessage = "",
      diagnosisMessage = "",
    } = {},
  } = TRANSLATIONS[userLanguage] || {};
  const isNonGroupMember = await getIsNonGroupMember(chatId);

  if (!userData?.telegramData) {
    const telegramData = msg.from;
    usersDataRef.child(chatId).set({ telegramData });
    selectLanguage(chatId);
  } else if (
    isNonGroupMember &&
    msg.text !== "/start" &&
    msg.text !== "/changelanguage"
  ) {
    subscribeRequest(chatId, userLanguage, bot);
  } else {
    switch (msg.text) {
      case "/start":
        bot.sendMessage(chatId, diagnosis).then(() => {
          bot.sendMessage(chatId, worningMessage);
        });
        break;

      case "/changelanguage":
        selectLanguage(chatId);
        break;

      case "/services":
        selectService(chatId, userLanguage);
        break;

      case "/subscribe":
        // subscribeRequest(chatId, userLanguage);
        break;

      case "/diagnosis":
        bot.sendMessage(chatId, worningMessage).then(() => {
          bot.sendMessage(chatId, diagnosis).then(() => {
            waitingForResponse[chatId] = async (question) => {
              openaiRequest({
                chatId,
                question,
                userLanguage,
                type: "diagnosis",
              });
            };
          });
        });
        break;

      case "/dosage":
        bot.sendMessage(chatId, worningMessage).then(() => {
          bot.sendMessage(chatId, dosage).then(() => {
            waitingForResponse[chatId] = async (question) => {
              openaiRequest({
                chatId,
                question,
                userLanguage,
                type: "dosage",
              });
            };
          });
        });
        break;

      case "/cancel":
        bot.sendMessage(chatId, cancelMessage);
        break;

      default:
        if (waitingForResponse[chatId]) {
          const callback = waitingForResponse[chatId];
          delete waitingForResponse[chatId];
          callback(msg);
        } else {
          bot.sendMessage(chatId, serviceMessage, {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: diagnosisMessage,
                    callback_data: "diagnosis",
                  },
                  {
                    text: dosageMessage,
                    callback_data: "dosage",
                  },
                ],
              ],
            },
          });
        }
    }
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
    userData?.selectedLanguage ||
    STATIC_USERS_DATA?.[chatId]?.selectedLanguage ||
    callbackQuery.message.from.language_code;
  const {
    worningMessage = "",
    subscribedMessag = "",
    nonMemberMessage = "",
    exampleMessages: { dosage = "", diagnosis = "" } = {},
  } = TRANSLATIONS[userLanguage] || {};

  function saveUserLanguage(language) {
    usersDataRef.child(chatId).update({
      selectedLanguage: language,
    });
    STATIC_USERS_DATA[chatId] = {
      selectedLanguage: language,
    };
  }

  if (["en", "ua", "fr", "es", "by", "ru", "ka"].includes(reply)) {
    bot.deleteMessage(chatId, messageId).then(async () => {
      const isNonGroupMember = await getIsNonGroupMember(chatId);
      saveUserLanguage(reply);
      if (isNonGroupMember) {
        subscribeRequest(chatId, reply, bot);
      } else {
        selectService(chatId, reply);
      }
    });
  } else if (reply === "check_membership") {
    bot
      .getChatMember(telegramGroupId, chatId)
      .then((chatMember) => {
        if (
          ["member", "creator", "administrator"].includes(chatMember.status)
        ) {
          bot.deleteMessage(chatId, messageId).then(() => {
            bot.sendMessage(chatId, subscribedMessag).then(() => {
              selectService(chatId, reply);
            });
          });
        } else {
          bot.answerCallbackQuery(callbackQuery.id, {
            text: nonMemberMessage,
          });
        }
      })
      .catch((error) => {
        console.error(`Error checking user membership: ${error}`);
      });
  } else if (reply === "diagnosis") {
    bot.deleteMessage(chatId, messageId).then(() => {
      bot.sendMessage(chatId, worningMessage).then(() => {
        bot.sendMessage(chatId, diagnosis).then(() => {
          waitingForResponse[chatId] = async (question) => {
            openaiRequest({
              chatId,
              question,
              userLanguage,
              type: "diagnosis",
            });
          };
        });
      });
    });
  } else if (reply === "dosage") {
    bot.deleteMessage(chatId, messageId).then(() => {
      bot.sendMessage(chatId, worningMessage).then(() => {
        bot.sendMessage(chatId, dosage).then(() => {
          waitingForResponse[chatId] = async (question) => {
            openaiRequest({
              chatId,
              question,
              userLanguage,
              type: "dosage",
            });
          };
        });
      });
    });
  } else if (reply === "cancel") {
    bot.deleteMessage(chatId, messageId);
  }
});

app.listen(process.env.PORT, () => {
  console.log("Express server is live");
  bot.startPolling();
});

bot.on("polling_error", (error) => {
  console.log("Received ETELEGRAM error with message:", error.message);
});
