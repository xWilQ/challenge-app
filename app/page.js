"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import styles from './page.module.css';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import CreateGame from './components/CreateGame';
import StartScreen from './components/StartScreen';

export default function Home() {

  const [createGame, setCreateGame] = useState(false);
  const [gameFound, setGameFound] = useState(false);


  // When the user clicks on the create game button, set create game to true to show the create game form.
  const handleOnCreateGame = () => {
    setCreateGame(!createGame);
  }

  const handleJoinGame = () => {
    console.log('IN PARENT COMPONENT: Game Joined!');
    setGameFound(true);
  }

  return (
    <div className={styles.container}>
      <div className={styles.formBackground}>
        {!createGame && !gameFound &&
          <StartScreen 
            onCreateGame={handleOnCreateGame} 
            onJoinGame={handleJoinGame}
            />
        }
        {createGame && !gameFound &&
        <CreateGame 
          onBack={handleOnCreateGame}
          onJoinGame={handleJoinGame}
        />
        }
        {!createGame && gameFound && <h1>IN GAME!</h1>}
        {createGame && gameFound && <h1>ADMIN VIEW!</h1>}
      </div>
    </div>
  );
}