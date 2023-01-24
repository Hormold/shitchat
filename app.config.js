import dotenv from 'dotenv';
dotenv.config();
module.exports = {
  "expo": {
    "name": "ShitGPT",
    "slug": "shitchat",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/icon.png",
        "backgroundColor": "#FFFFFF"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "bf2b911c-d40b-4931-a2ba-382d8ae152b3"
      },
      "apiKey": process.env.API_KEY,
	  "authDomain": process.env.AUTH_DOMAIN,
	  "databaseURL": process.env.DATABASE_URL,
	  "projectId": process.env.PROJECT_ID,
	  "storageBucket": process.env.STORAGE_BUCKET,
	  "messagingSenderId": process.env.MESSAGING_SENDER_ID,
	  "appId": process.env.APP_ID,
    },
    "owner": "hormold"
  }
}
