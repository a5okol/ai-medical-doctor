const TRANSLATIONS = require("./translations");
const bot = require("./services/telegramBotService");

const telegramGroupId = process.env.TELEGRAM_GROUP_ID;

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

const selectLanguage = (chatId) => {
  bot.sendMessage(chatId, "Please select your language:", {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "EN", callback_data: "en" },
          { text: "UA", callback_data: "ua" },
          { text: "BY", callback_data: "by" },
          { text: "KA", callback_data: "ka" },
          { text: "FR", callback_data: "fr" },
          { text: "RU", callback_data: "ru" },
          { text: "ES", callback_data: "es" },
        ],
      ],
    },
  });
};

const selectService = (chatId, userLanguage) => {
  const {
    service: { serviceMessage = "", diagnosisMessage = "", dosageMessage = "" },
  } = TRANSLATIONS[userLanguage];
  bot.sendMessage(chatId, serviceMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          { text: diagnosisMessage, callback_data: "diagnosis" },
          { text: dosageMessage, callback_data: "dosage" },
        ],
      ],
    },
  });
};

const getIsNonGroupMember = async (chatId) => {
  const chatMember = await bot.getChatMember(telegramGroupId, chatId);
  const isGroupMember =
    chatMember?.status === "member" ||
    chatMember?.status === "creator" ||
    chatMember?.status === "administrator";
  return !isGroupMember;
};

const STATIC_USERS_DATA = {};

module.exports = {
  STATIC_USERS_DATA,
  selectService,
  selectLanguage,
  subscribeRequest,
  // openaiRequestByType,
  getIsNonGroupMember,
};
