"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import styles from './page.module.css';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import JoinGame from './components/JoinGame';
import CreateGame from './components/CreateGame';

export default function Home() {

  const [createGame, setCreateGame] = useState(false);

  // When the user clicks on the create game button, set create game to true to show the create game form.
  const handleOnCreateGame = () => {
    setCreateGame(true);
  }

  return (
    <div className={styles.container}>
      <div className={styles.formBackground}>
        {!createGame ? (
          <JoinGame 
            onCreateGame={handleOnCreateGame} />
        ):(
        <CreateGame 
        />
        )}
      </div>
    </div>
  );
}