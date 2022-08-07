import React, { useRef, useState } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getDocs, query, collection, where, orderBy } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import './Chatroom.css';

firebase.initializeApp({
    apiKey: `${process.env.REACT_APP_API_KEY}`,
    authDomain: 'superchat-fccc5.firebaseapp.com',
    projectId: 'superchat-fccc5',
    storageBucket: 'superchat-fccc5.appspot.com',
    messagingSenderId: '491122069720',
    appId: '1:491122069720:web:ae21e9bef7b327b67a07ad',
    measurementId: 'G-GXGTGMLMZP',
});

var Filter = require('bad-words'),
    filter = new Filter();

const auth = firebase.auth();

const firestore = firebase.firestore();

// let id=10;

//fetch name of chatroom from chatrooms collection

//create collection of messages for chatroom chatrooms/:id/messages

export const Chatroom = () => {
    const [user] = useAuthState(auth);
    return (
        <div className='Chatroom'>
            <header>
                <h1>⚛️🗿💬</h1>
                <h1>locaChat</h1>
            </header>
            <ChatRoom />
        </div>
    );
};

function getLocation() {
    if (navigator.geolocation) {
        return navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        console.log('Geolocation is not supported by this browser.');
    }
}
var lat, long;
function showPosition(position) {
    // console.log(position.coords.latitude, position.coords.longitude);
    lat = position.coords.latitude;
    long = position.coords.longitude;
}
setInterval(getLocation, 2000);
//access id from url passed as parameter
const ChatRoom = () => {
    const dummy = useRef();
    // get messsages from firebase whose latitude and longitude are within 2km of the user's location
    let paramString = window.location.href.split('?')[1];
    let queryString = new URLSearchParams(paramString);
    let id = queryString.get('id');
    const messagesRef = firebase
        .firestore()
        .collection('chatrooms')
        .doc(id)
        .collection('messages');
    let messagesRef1 = firestore
        .collection('chatrooms')
        .doc(id)
        .collection('messages');

    const [messages] = useCollectionData(messagesRef, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;
        //use nlp to check message for cyberbullying or racism or sexism or other offensive language and if so, don't send message
        if (filter.isProfane(formValue)) {
            alert(
                "Please don't send messages that are offensive to other people"
            );
        } else {
            await messagesRef1.add({
                text: formValue,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                uid,
                photoURL,
                latitude: lat,
                longitude: long,
            });
        }

        setFormValue('');
        dummy.current.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <>
            <main>
                {messages &&
                    messages
                        .filter((msg) => {
                            return (
                                msg.latitude <= lat + 0.02 &&
                                msg.latitude >= lat - 0.02 &&
                                msg.longitude <= long + 0.02 &&
                                msg.longitude >= long - 0.02
                            );
                        })
                        .map((msg) => (
                            <ChatMessage key={msg.id} message={msg} />
                        ))}
            </main>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder='Type your message'
                />

                <button type='submit' disabled={!formValue} id='sendButton'>
                    📨
                </button>
            </form>
        </>
    );
};

export const ChatMessage = (props) => {
    const { text, uid, photoURL } = props.message;

    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    return (
        <>
            <div className={`message ${messageClass}`}>
                <img
                    src={
                        photoURL ||
                        'https://api.adorable.io/avatars/23/abott@adorable.png'
                    }
                />
                <p>{text}</p>
            </div>
        </>
    );
};

export default Chatroom;
