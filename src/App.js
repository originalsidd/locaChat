import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getDocs, query, collection, where, orderBy } from 'firebase/firestore';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Redirect,
} from 'react-router-dom';
import Chatroom from './components/chatroom';
import { Home } from './components/Home';
import Load from './components/Load';

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

function App() {
    const [user] = useAuthState(auth);
    const [loaded, setLoaded] = useState(false);
    const [spin, setSpin] = useState(false);
    const loading = () => {
        setSpin(true);
        setTimeout(() => setSpin(false), 500);
        setLoaded(true);
    };
    return (
        <div className='root'>
            {spin ? (
                <div className='spinner'>
                    <div className='loader' />
                </div>
            ) : !loaded ? (
                <>
                    <Load />
                    {setTimeout(loading, 2000)}
                </>
            ) : (
                <Router>
                    <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/chatroom' element={<Chatroom />} />
                    </Routes>
                </Router>
            )}
        </div>
    );
}
export default App;
