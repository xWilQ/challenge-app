"use client";
import React, { useEffect, useState } from 'react';
import styles from './main.module.css';
import { db } from '../../firebaseConfig';
import { collection, doc , getDoc, getDocs, addDoc, setDoc, updateDoc, query, where } from 'firebase/firestore';

const StartScreen = ({ onCreateGame, onJoinGame, _gameFound, _gameCode, _gameData, _username}) => {

    const [username, setUsername] = useState('');
    const [gameCode, setGameCode] = useState('');
    const [gameData, setGameData] = useState(null);


    const [gameFound, setGameFound] = useState(false);
    const [gameJoined, setGameJoined] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (gameJoined) {
            console.log(`${username} joined game #${gameCode}`);
            _username = username;
            onJoinGame(username);
        }
    }, [gameJoined]);

    useEffect(() => {
        console.log('Parent component game found:', _gameFound);
        setGameFound(_gameFound);
        setGameData(_gameData);
        setGameCode(_gameCode);
    },[]);

    const submitGameCode = (e) => {
        e.preventDefault();
        
        // Remove all white spaces and convert to lowercase, save game code to local storage.
        const processedCode = gameCode.replace(/\s/g, "").trim().toUpperCase();
        setGameCode(processedCode);
        localStorage.setItem('gameCode', processedCode);

        // Check if game code exists in database
        handleJoinGame();
    }

    const handleJoinGame = async () => {
        
        setLoading(true);
        const code = localStorage.getItem('gameCode');
        
        if (code) {
            const gameRef = doc(db, "games", code);
            const gameSnap = await getDoc(gameRef);
            
            if (gameSnap.exists()) {
                setGameData(gameSnap.data());

                setErrorMessage('');
                setLoading(false);
                setGameFound(true);
            }
            else {
                setLoading(false);
                setGameCode('');
                setErrorMessage(`No game found with code: ${gameCode}`);
            }
        }
    }

    const submitUserName = (e) => {
        e.preventDefault();
        e.preventDefault();
        //const processedName = e.target.value.replace(/\s/g, "").trim().toUpperCase();
        
        // Save username to local storage
        localStorage.setItem('username', username);

        JoinGame(username);
    }


    const JoinGame = async (USERNAME) => {

        setLoading(true);

        console.log('Attempting to join the game with username:', USERNAME);

        // Check if the name is taken in the game
        try {
            const playersRef = collection(db, "games", gameCode, "players");
            const q = query(playersRef, where("name", "==", USERNAME));
            const querySnapshot = await getDocs(q);

            // If the username is free, write the user to the database
            if (querySnapshot.empty) {
                
                const userDocRef = doc(playersRef, USERNAME);
                
                await setDoc(userDocRef, {
                    name: USERNAME,
                    createdAt: new Date()   
                });
                
                setGameJoined(true);
            } 
            // If the username is taken, show an error message
            else {
                console.log('Username is already taken.');  
                setErrorMessage('Username is already taken.');     
            }
        } 
        catch (error) {
            console.error("Error checking username:", error);
            setErrorMessage('Error checking username.');
        }
        finally {
            setLoading(false);
        }
    }

    const onGameCodeChange = (e) => {
        e.preventDefault();
        const processedCode = e.target.value.replace(/\s/g, "").trim().toUpperCase();
        setGameCode(processedCode);
        setLoading(false);
        setErrorMessage('');
    }

    const onNameChange = (e) => {
        e.preventDefault();
        setUsername(e.target.value.toUpperCase());
        setErrorMessage('');
    }

    const onBack = () => {
        setGameFound(false)
    }

    return (
        <div className={styles.background}>
            <div className={styles.containerLeft}>
                {!gameFound &&
                <form onSubmit={submitGameCode}>
                    <h1>JOIN A GAME</h1>
                    <div className={styles.errorMessage}>
                        {errorMessage && <p>{errorMessage}</p>}
                    </div>
                    <h2 className={styles.subtitle}>ENTER GAME CODE</h2>
                    <input
                        type="text"
                        value={gameCode}
                        onChange={(e) => onGameCodeChange(e)}
                        maxLength='4'
                        placeholder="ENTER 4 LETTER CODE"
                        required
                        className={styles.input}
                    />
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'LOADING...' : 'ENTER' }
                    </button>
                </form>
                }
                {gameFound &&
                <>
                <form onSubmit={submitUserName}>
                    <h1 className={styles.title}>{gameData.gameName}</h1>
                    <p className={styles.gameDescription}>{gameData.gameDescription}</p>
                    <div className={styles.subtitle2}>
                        <p>ENTER USERNAME</p>
                        <p>{12 - username.length}</p>
                    </div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => onNameChange(e)}
                        placeholder="USERNAME"
                        maxLength='12'
                        required
                        className={styles.input}
                    />
                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'LOADING...' : 'JOIN GAME' }
                    </button>
                </form>
                <button className={styles.button} onClick={onBack}>BACK</button>
                </>
                }
            </div>
            {!gameFound &&
                <>
                <h1 style={{ padding: '20px'}}>OR</h1>
                <div className={styles.containerRight}>
                    <button onClick={onCreateGame} className={styles.button}>CREATE A GAME</button>
                    <button className={styles.button}>ADMIN LOGIN</button>
                </div>
                </>
            }
        </div>
    );
};

export default StartScreen;