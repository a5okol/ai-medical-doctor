<div class="markdown prose w-full break-words dark:prose-invert dark"><h1>AI Medical Doctor Telegram Bot</h1><h2>Project Overview</h2><p>This Telegram bot, the AI Medical Doctor, is designed to assist users in predicting medical diagnoses based on symptoms and calculating medication dosages. Please note that access to this bot is restricted to subscribed group members only.</p><h2>Dependencies</h2><p>To run this bot, you'll need the following dependencies:</p><ul><li><p><strong>Telegram API:</strong> You'll need a Telegram bot token and group ID for integration. Fill in the TELEGRAM_TOKEN and TELEGRAM_GROUP_ID fields in your <code>.env</code> file.</p></li><li><p><strong>Firebase:</strong> Firebase is used for data storage and real-time communication. Make sure to provide the necessary Firebase configuration in your <code>.env</code> file, including FIREBASE_PROJECT_ID, FIREBASE_CLIENT_ID, FIREBASE_PRIVATE_KEY_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_REALTIME_URL, FIREBASE_CLIENT_X509_CERT_URL, and FIREBASE_PRIVATE_KEY.</p></li><li><p><strong>Express.js:</strong> This Node.js framework is used to build the server for handling bot requests and interactions.</p></li><li><p><strong>ChatGPT API:</strong> Integration with the ChatGPT API is required for medical diagnosis predictions and medication dosage calculations. Provide your OPENAI_API_KEY in the <code>.env</code> file.</p></li></ul><h2>Environment Configuration</h2><p>Before running the bot, create an <code>.env</code> file in the root directory of your project and populate it with the following values:</p><pre><div class="bg-black rounded-md mb-4"><div class="flex items-center relative text-gray-200 bg-gray-800 px-4 py-2 text-xs font-sans justify-between rounded-t-md"><span></span><button class="flex ml-auto gap-2"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg></button></div><div class="p-4 overflow-y-auto"><code class="!whitespace-pre hljs language-env">TELEGRAM_TOKEN=
TELEGRAM_GROUP_ID=
OPENAI_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_ID=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_REALTIME_URL=
FIREBASE_CLIENT_X509_CERT_URL=
FIREBASE_PRIVATE_KEY=
</code></div></div></pre><h2>Usage</h2><ol><li><p>Clone this repository to your local machine.</p></li><li><p>Run <code>npm install</code> to install all project dependencies.</p></li><li><p>Populate the <code>.env</code> file with the required configuration values.</p></li><li><p>Run the bot using <code>npm start</code>.</p></li><li><p>Users in the subscribed group can interact with the bot to predict medical diagnoses based on symptoms and calculate medication dosages.</p></li></ol><h2>Features</h2><ul><li><p><strong>Language Support:</strong> The bot offers support for 7 languages to cater to a diverse user base.</p></li><li><p><strong>Medical Diagnosis Prediction:</strong> Users can input their symptoms, and the bot will provide predictions on possible medical conditions.</p></li><li><p><strong>Medication Dosage Calculation:</strong> The bot can calculate medication dosages based on user-specific parameters.</p></li></ul><h2>Additional Information</h2><ul><li>This bot can be used only after subscribing to the group.</li></ul><h2>Contributing</h2><p>We welcome contributions from the community to enhance and improve this AI Medical Doctor Telegram bot. Feel free to open issues, submit pull requests, or provide feedback to help us make this project even better.</p><h2>License</h2><p>This project is licensed under the <a href="LICENSE" target="_new">MIT License</a>.</p></div>
