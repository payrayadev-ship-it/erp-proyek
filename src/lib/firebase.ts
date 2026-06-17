import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA_eLR3wcn_87jV_Vlc6_AqWR8jc-5_EYM",
  authDomain: "erp-proyek.firebaseapp.com",
  projectId: "erp-proyek",
  storageBucket: "erp-proyek.firebasestorage.app",
  messagingSenderId: "737403979074",
  appId: "1:737403979074:web:23cef7ec47c5f53d7f34db"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-8cdb12d1-9369-4b51-be1d-9f721b75309b");

// Validate connection to Firestore as per SKILL.md critical rules
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase connection established successfully.");
  } catch (error) {
    if (error instanceof Error && (error.message.includes("client is offline") || error.message.includes("Could not reach Cloud Firestore"))) {
      console.warn("Please check your Firebase configuration or networks.");
    } else {
      console.log("Firestore connection test completed (expected offline or permission status).");
    }
  }
}

testConnection();
