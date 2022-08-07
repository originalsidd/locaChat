import React, { useRef, useState } from 'react';
import '../App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getDocs, query, collection, where, orderBy } from 'firebase/firestore';
import { BsFillArrowRightCircleFill } from 'react-icons/bs';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Redirect,
} from 'react-router-dom';
import Load from './Load';
import { useEffect } from 'react';

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
export const Home = () => {
    const [user] = useAuthState(auth);
    const [pop, setPop] = useState(false);
    const [text, setText] = useState('');

    const modalHandler = () => {
        setPop(true);
    };

    const createRoomHandler = () => {
        if (text == '' || text == null) {
            return;
        }
        var id = Math.floor(Math.random() * 1000000);
        var idString = id.toString();
        while (idString.length < 6) {
            idString = '0' + idString;
        }
        var roomName = text;
        firestore
            .collection('chatrooms')
            .doc(idString)
            .set({
                id: idString,
                name: roomName,
                latitude: lat,
                longitude: long,
                uid: auth.currentUser.uid,
            })
            .then(function () {
                console.log('Document successfully written!');
                window.location = '/chatroom?id=' + idString;
            })
            .catch(function (error) {
                console.error('Error writing document: ', error);
            });
        setPop(false);
    };

    const joinRoomHandler = () => {
        if (text == '' || text == null) {
            return;
        }
        var roomId = text;
        firestore
            .collection('chatrooms')
            .doc(roomId)
            .get()
            .then(function (doc) {
                if (doc.exists) {
                    // redirect to chatroom
                    window.location.href = '/chatroom?id=' + roomId;
                } else {
                    alert('Chatroom does not exist');
                }
            });
    };

    return (
        <div className='Home'>
            {pop ? (
                <div className='popup-screen'>
                    <div className='popup'>
                        <input
                            type='text'
                            name='name'
                            onChange={(e) => setText(e.target.value)}
                            stule={{ width: 200 }}
                        />
                        <div>
                            <button onClick={createRoomHandler}>Create</button>
                            <button onClick={joinRoomHandler}>
                                &nbsp;Join&nbsp;&nbsp;
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                setPop(false);
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : null}
            <section>
                {user ? (
                    <>
                        <header>
                            <span>
                                <button
                                    className='plus-button'
                                    onClick={modalHandler}
                                >
                                    ⚠️
                                </button>
                                <button
                                    className='plus-button'
                                    onClick={modalHandler}
                                >
                                    ➕
                                </button>
                            </span>
                            <h1>
                                locaChat
                                {/* <a href='public\a1.html'>SOS</a> */}
                            </h1>
                            <SignOut />
                        </header>
                        <ChatRoom />
                    </>
                ) : (
                    <SignIn />
                )}
            </section>
        </div>
    );
};

export const SignIn = () => {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return (
        <div className='signin'>
            <button className='sign-in' onClick={signInWithGoogle}>
                Sign in with Google&nbsp;&nbsp;
                <BsFillArrowRightCircleFill />
            </button>
            <p id='signinmsg'>El Psy Kongroo</p>
        </div>
    );
};

export const SignOut = () => {
    return (
        auth.currentUser && (
            <button className='sign-out' onClick={() => auth.signOut()}>
                &nbsp;&nbsp;&nbsp;&nbsp;Sign Out&nbsp;&nbsp;&nbsp;&nbsp;
            </button>
        )
    );
};

// ask for location permission and get user location to display in chat room
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

export const ChatRoom = () => {
    const dummy = useRef();
    const [spin, setSpin] = useState(false);

    let messagesRef1 = firestore.collection('messages');

    let messagesRef = firestore.collection('messages');
    messagesRef = messagesRef.orderBy('createdAt');

    const doc = getDocs(messagesRef);
    console.log(doc);
    const [messages] = useCollectionData(messagesRef, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const sendMessage = async (e) => {
        e.preventDefault();

        const { uid, photoURL } = auth.currentUser;
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

    useEffect(() => {
        setSpin(true);
    }, []);

    const loading = () => {
        setTimeout(() => setSpin(false), 500);
    };

    setTimeout(loading, 1000);

    return (
        <>
            {spin ? (
                <div className='spinner'>
                    <div className='loader' />
                </div>
            ) : (
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

                    <span ref={dummy}></span>
                </main>
            )}
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

//create a new chatroom
//   function NewChatRoom(props) {
//     const { name } = props;
//     const [messages, setMessages] = useState([]);
//     const [formValue, setFormValue] = useState('');

//     const messagesRef = firestore.collection('messages');
//     const query = messagesRef.where('chatroom', '==', name);
//     const doc = getDocs(query)
//     console.log(doc)
//     const [messages1] = useCollectionData(query, { idField: 'id' });
//     console.log(messages1)

//     const sendMessage = async (e) => {
//       e.preventDefault();
//       const { uid, photoURL } = auth.currentUser;
//       await messagesRef.add({
//         text: formValue,
//         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
//         uid,
//         photoURL,
//         chatroom: name
//       })
//       setFormValue('');
//     }
//  }

export default Home;
