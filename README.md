# AI Doctor Chatbot

This code provides the implementation of an AI Doctor chatbot, capable of analyzing users' symptoms and suggesting diagnoses and treatments based on them. The chatbot is built with Node.js, Firebase, and OpenAI, and it communicates with users via Telegram.

## Setup

To use this chatbot, you need to perform the following steps:

1.  Clone this repository to your local machine.
2.  Install the required dependencies by running `npm install`.
3.  Create a Telegram bot and obtain its API token. You can learn how to do it from [here](https://core.telegram.org/bots#6-botfather).
4.  Create a Firebase account and project, and create a Realtime Database within the project. You can learn how to do it from [here](https://firebase.google.com/docs/database/web/start).
5.  Create a service account and obtain its private key in JSON format. You can learn how to do it from [here](https://firebase.google.com/docs/admin/setup#initialize-sdk).
6.  Obtain an API key for the OpenAI API. You can learn how to do it from [here](https://beta.openai.com/docs/api-reference/introduction).
7.  Create a `.env` file in the root directory of the project, and add the following environment variables to it:

```makefile
TELEGRAM_TOKEN=<your Telegram bot API token>
FIREBASE_CLIENT_ID=<your Firebase service account client ID>
FIREBASE_PROJECT_ID=<your Firebase project ID>
FIREBASE_CLIENT_EMAIL=<your Firebase service account client email>
FIREBASE_PRIVATE_KEY_ID=<your Firebase service account private key ID>
FIREBASE_CLIENT_X509_CERT_URL=<your Firebase service account client x509 cert URL>
FIREBASE_PRIVATE_KEY=<your Firebase service account private key in PEM format>
FIREBASE_REALTIME_URL=<your Firebase Realtime Database URL>
OPENAI_API_KEY=<your OpenAI API key>
```

Make sure to replace `<your Telegram bot API token>`, `<your Firebase ...>`, and `<your OpenAI API key>` with the respective values you obtained in the previous steps. 8. Run the chatbot by executing the `npm start` command.

## Usage

Once you have set up the chatbot, you can interact with it via the Telegram app. Simply start a conversation with the bot and follow the instructions it provides. The bot will ask you to describe your symptoms, and based on your input, it will suggest a diagnosis and treatment.
The chatbot currently supports four languages: English, Ukrainian, French, and Spanish. You can switch between them by sending the corresponding language code to the bot (`en`, `ua`, `fr`, `es`).

## Credits

This chatbot was developed by [OpenAI](https://openai.com/) as part of its effort to build artificial intelligence that benefits humanity.
