import firebase from "firebase/app";

// 사용할 것들을 전부 불러옵니다 :)
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import "firebase/database";

const firebaseConfig = {
  // 인증 정보를 넣어주세요!
  apiKey: "AIzaSyAba98bhMhizYlbP-CZl4WhtPa6BmU6_80",
  authDomain: "react-2nd-login-signup-posting.firebaseapp.com",
  projectId: "react-2nd-login-signup-posting",
  storageBucket: "react-2nd-login-signup-posting.appspot.com",
  messagingSenderId: "1045501679880",
  appId: "1:1045501679880:web:b0766562188e8fc442b4bd",
  measurementId: "G-6YBN77CTVT"
};

firebase.initializeApp(firebaseConfig);

const apiKey = firebaseConfig.apiKey;
const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();
const realtime = firebase.database();

export { auth, apiKey, firestore, storage, realtime };
