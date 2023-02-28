/* eslint-disable max-len */
/* eslint-disable no-console */
require("dotenv").config();
const express = require("express");
const firebaseAdmin = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");

const TelegramBot = require("node-telegram-bot-api");
const serviceAccount = require("../serviceAccountKey.json");

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

const STATIC_USERS_DATA = {};
const TRANSLATIONS = {
  en: {
    welcomeMessege:
      "Hello! \nWelcome to our AI Doctor bot 👩‍⚕️. We're excited to have you here. \nTo stay up-to-date with our community and the latest news, please join our community at:\nhttps://t.me/ai_doctor_community. \n\nThanks for joining us! \nWe will be happy to help!",
    exampleMessage: `To obtain information on treatment, we kindly ask that you submit your request in the following format: \n\n"Inflammation, a fever of up to 38 degrees, sneezing, nasal congestion or a runny nose, green sputum for three days, a sore throat, coughing, mucus dripping from the nasopharynx, as well as mild headaches and mild body pain."`,
    waitingMessage: "Please wait, I'm thinking...",
    additionalQuestionMessage: "Suggest a diagnosis and how to treat: ",
  },
  ua: {
    welcomeMessege:
      "Вітаю! \nЛаскаво просимо до нашого бота AI Doctor 👩‍⚕️. Ми раді бачити вас тут. \nЩоб бути в курсі подій нашої спільноти та останніх новин, будь ласка, приєднайтеся до нашої спільноти за адресою:\nhttps://t.me/ai_doctor_community. \n\nДякуємо, що приєдналися до нас! \nБудемо раді допомогти!",
    exampleMessage: `Для отримання діагнозу та рекомендацій щодо лікування, будь ласка, опишіть свої симптоми та відчуття. \n\nНаприклад:\n\n"Запалення, підвищена температура до 38 градусів, чхання, закладеність носа чи нежить, зелене мокротиння протягом трьох днів, біль у горлі, кашель, стікання слизу з носоглотки, легкий головний біль та легкий біль у тілі".`,
    waitingMessage: "Будь ласка, зачекайте, я думаю...",
    additionalQuestionMessage: "Підскажи діагноз і як лікувати: ",
  },
  fr: {
    welcomeMessege:
      "Bonjour! \nBienvenue dans notre robot AI Doctor 👩‍⚕️. Nous sommes ravis de vous accueillir ici. \nPour rester informé de l'actualité de notre communauté et des dernières actualités, veuillez rejoindre notre communauté à :\nhttps:// t.me/ai_doctor_community. \n\nMerci de nous avoir rejoint ! \nNous serons ravis de vous aider !",
    exampleMessage: `Pour obtenir des informations sur le traitement, nous vous prions de bien vouloir soumettre votre demande dans le format suivant: \n\n"Inflammation, fièvre jusqu'à 38 degrés, éternuements, congestion nasale ou écoulement nasal, crachats verts pendant trois jours, un mal de gorge, de la toux, du mucus dégoulinant du nasopharynx, ainsi que de légers maux de tête et de légères douleurs corporelles."`,
    waitingMessage: "Veuillez patienter, je réfléchis...",
    additionalQuestionMessage: "Suggérer un diagnostic et comment traiter : ",
  },
  es: {
    welcomeMessege:
      "¡Hola! \nBienvenido a nuestro bot AI Doctor 👩‍⚕️. Estamos encantados de tenerte aquí. \nPara mantenerte al día con nuestra comunidad y las últimas noticias, únete a nuestra comunidad en:\nhttps:// t.me/ai_doctor_community. \n\n¡Gracias por unirse a nosotros! \n¡Estaremos encantados de ayudar!",
    exampleMessage: `Para obtener información sobre el tratamiento, le rogamos que envíe su solicitud en el siguiente formato: \n\n"Inflamación, fiebre de hasta 38 grados, estornudos, congestión nasal o secreción nasal, esputo verde durante tres días, dolor de garganta, tos, mucosidad que gotea de la nasofaringe, así como dolores de cabeza leves y dolor corporal leve".`,
    waitingMessage: "Por favor, espera, estoy pensando...",
    additionalQuestionMessage: "Sugerir un diagnóstico y tratamiento: ",
  },
  by: {
    welcomeMessege:
      "Прывітанне! \nВітаем нашага робата AI Doctor 👩‍⚕️. Мы рады, што вы тут. \nКаб заставацца ў курсе нашай суполкі і апошніх навін, далучайцеся да нашай суполкі па адрасе:\nhttps:// t.me/ai_doctor_community. \n\nДзякуй, што далучыліся да нас! \nМы будзем рады дапамагчы!",
    exampleMessage: `Для атрымання інфармацыі аб лячэнні просім вас адправіць запыт у наступным фармаце: \n\n"Запаленне, павышэнне тэмпературы да 38 градусаў, чханне, заложенность носа або насмарк, зялёная мокрота на працягу трох дзён пяршэнне ў горле, кашаль, вылучэнне слізі з насаглоткі, а таксама лёгкія галаўныя і слабыя болі ў целе".`,
    waitingMessage: "Калі ласка, пачакайце, я думаю...",
    additionalQuestionMessage: "Прапануйце дыягназ і як лячыць: ",
  },
};

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

bot.on("message", async (msg) => {
  const usersDataRef = db.ref("usersData");
  const getUsersIDs = await usersDataRef.get();
  const usersIDs = await getUsersIDs.val();

  // ----------- // ------------ //

  const chatId = msg.chat.id;
  const userData = usersIDs?.[msg.chat.id];
  const userLanguage =
    userData?.selectedLanguage || STATIC_USERS_DATA?.[chatId]?.selectedLanguage;

  if (msg.text === "/start") {
    if (!usersIDs?.[chatId]?.telegramData) {
      const telegramData = msg.from;
      usersDataRef.child(chatId).set({
        telegramData,
      });
      selectLanguage(chatId);
    } else {
      bot.sendMessage(chatId, TRANSLATIONS[userLanguage].exampleMessage);
    }
  } else if (msg.text === "/changelanguage") {
    selectLanguage(chatId);
  } else {
    bot
      .sendMessage(chatId, TRANSLATIONS[userLanguage].waitingMessage)
      .then(async (sentMessage) => {
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt: `${TRANSLATIONS[userLanguage].additionalQuestionMessage} "${msg.text}"`,
          max_tokens: 1200,
          temperature: 0,
        });
        const message = response.data.choices[0].text;
        bot.sendMessage(chatId, message);
        usersDataRef
          .child(chatId)
          .child("questions")
          .update({
            [msg.message_id]: {
              question: msg.text,
              answer: message,
            },
          });
        bot.deleteMessage(chatId, sentMessage.message_id);
      });
  }
});

bot.on("callback_query", async (callbackQuery) => {
  const usersDataRef = db.ref("usersData");
  const chatId = callbackQuery.message.chat.id;
  const reply = callbackQuery.data;
  const messageId = callbackQuery.message.message_id;

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
    bot.sendMessage(chatId, TRANSLATIONS[reply]?.welcomeMessege).then(() => {
      bot.sendMessage(chatId, TRANSLATIONS[reply]?.exampleMessage);
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
