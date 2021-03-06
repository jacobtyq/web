import FirebaseConfig from "./FirebaseConfig.json"
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

firebase.initializeApp(FirebaseConfig)

let firestore = firebase.firestore()
firestore.settings({ timestampsInSnapshots: true })

export {
  firebase,
  firestore
}