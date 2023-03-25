const { Configuration, OpenAIApi } = require("openai");

const bot = require("./telegramBotService");
const TRANSLATIONS = require("./../translations");
const { firebase } = require("./firebaseService");

const db = firebase.database();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const openaiRequest = async ({ chatId, userLanguage, question, type }) => {
  const usersDataRef = db.ref("usersData");
  const { waitingMessage = "", additionalQuestionMessage } =
    TRANSLATIONS[userLanguage] || {};
  bot.sendMessage(chatId, waitingMessage).then(async (sentMessage) => {
    const { data } = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${additionalQuestionMessage[type]} "${question.text}"`,
      max_tokens: 1200,
      temperature: 0,
    });
    const responceMessage = data.choices[0].text.replaceAll(
      "ChatGPT",
      "AI Medical Doctor"
    );
    bot.sendMessage(chatId, responceMessage);
    bot.deleteMessage(chatId, sentMessage.message_id);
    usersDataRef
      .child(chatId)
      .child("questions")
      .update({
        [question.message_id]: {
          question: question.text,
          answer: responceMessage,
        },
      });
  });
};

module.exports = openaiRequest;
