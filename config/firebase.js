export const config = {
	GOOGLE_AUTH_KEY: '241630393779-bfjo6in2b8bifk8qnk099qktk479pgc0.apps.googleusercontent.com', //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
	apiKey: 'AIzaSyD2uqijq_eq7LkrCChCX1JFPO_5L6uA5zc',
	authDomain: "gptchat-3ed99.firebaseapp.com",
  	databaseURL: "https://gptchat-3ed99.firebaseapp.com"
};

import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2uqijq_eq7LkrCChCX1JFPO_5L6uA5zc",
  authDomain: "gptchat-3ed99.firebaseapp.com",
  databaseURL: "https://gptchat-3ed99-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "gptchat-3ed99",
  storageBucket: "gptchat-3ed99.appspot.com",
  messagingSenderId: "241630393779",
  appId: "1:241630393779:web:b0d849a1f2baa3c9edc7c6"
};

// Initialize Firebase
export const firebase = initializeApp(firebaseConfig);
