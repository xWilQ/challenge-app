"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import styles from './mainscene.module.css';
import CreateGame from './CreateGame';
import StartScreen from './StartScreen';
import ChallengeCard from './ChallengeCard';
import { Main } from 'next/document';

const MainScene = (props) => {
  
  const [username, setUsername] = useState('');
  const [gameCode, setGameCode] = useState(null);
  const [createGame, setCreateGame] = useState(false);
  const [gameFound, setGameFound] = useState(false);
  const [showChallenges, setShowChallenges] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ammountSkipped, setAmmountSkipped] = useState(0);
  const [ammountCompleted, setAmmountCompleted] = useState(0);
  const cardColors = ['#4cc9f0', '#4361ee', '#3a0ca3', '#7209b7', '#AD18B5'];

    const handleJoinGame = (_username) => {
        console.log('IN PARENT COMPONENT: Game Joined!');
        console.log('_username:', _username);
        setUsername(_username);
        setGameCode(props.gameCode);
    }

    useEffect(() => {
      if(username){
        fetchInitialChallenges();
      }
    }, [username]);
    
    const handleSkip = async (challenge) => {
      console.log('Skip:', challenge);
    }

    const handleSubmit = async (challenge, comment, photo) => {
      console.log('Submit:', challenge, comment, photo);
    }

    const fetchInitialChallenges = async () => {

      const challengesCollection = collection(db, 'kalajoki24');
      const challengesSnapshot = await getDocs(challengesCollection);
      const allChallenges = challengesSnapshot.docs.map(doc => doc.data());

      // Shuffle the challenges array and select 5
      const shuffledChallenges = allChallenges.sort(() => Math.random() - 0.5).slice(0, 5);
      setChallenges(shuffledChallenges);
      
      // Print the fetched challenges to the console
      console.log('Initial challenges:', shuffledChallenges);
      
      console.log('Username in fetch:', username);
      const userDocRef = doc(db, "games", props.gameCode, "players", username);
      const userDoc = await getDoc(userDocRef);
      let userData = null;
      
      console.log('trying to fetch user data', username);
      
      if (userDoc.exists()) {
        console.log('User exists:', username);
        userData = userDoc.data();
        
        await setDoc(userDocRef, {
          ...userData,
          challenges: shuffledChallenges,
        });
      } 

      setShowChallenges(true);
    }

    const sortedChallenges = challenges.sort((a, b) => {
      // Define the order of statuses and assign 'pending' as the default status for challenges without a status
      const statusOrder = { 'pending': 1, 'skipped': 2, 'completed': 3 };
      const statusA = a.status || 'pending';
      const statusB = b.status || 'pending';
      
      return statusOrder[statusA] - statusOrder[statusB];
    });

    return (
        <>
          {!createGame && !gameFound && !showChallenges ? (    
            <div className={styles.formBackground}>
              <StartScreen
                  _gameFound={true}
                  _gameData={props.gameData}
                  _gameCode={props.gameCode}
                  _username={username}
                  onJoinGame={handleJoinGame}
              />
            </div>
            ):(
              <div className={styles.cardsContainer}>     
                <div className={styles.stats}>
                  <h1 className={styles.welcome}>Tervetuloa {username.charAt(0).toUpperCase() + username.slice(1)}!</h1>
                  <p> {ammountCompleted} haastetta suoritettu</p>
                  <p> {ammountSkipped} haastetta skipattu</p>
                </div>
                {loading ? (
                  <p className={styles.loading}>Ladataan haasteita...</p>
                ) : challenges.length > 0 ? (
                  sortedChallenges.map((challenge, index) => (
                    <ChallengeCard
                      key={index}
                      challenge={challenge}
                      onSkip={handleSkip}
                      onSubmit={handleSubmit}
                      backgroundColor={cardColors[index % cardColors.length]}
                      ammountSkipped={ammountSkipped}
                      username={username}
                    />
                  ))
                ) : (
                  <p className={styles.noChallenges}>Haasteita ei ollut saatavilla.</p>
                )}
              </div>
            )}
            
      {createGame && !gameFound &&
          <CreateGame 
              onBack={handleOnCreateGame}
              onJoinGame={handleJoinGame}
          />
      }
      {!createGame && gameFound && <h1>IN GAME!</h1>}
      {createGame && gameFound && <h1>ADMIN VIEW!</h1>}
      </>
    );
};

export default MainScene;