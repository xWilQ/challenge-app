import React, { useState, useEffect } from 'react';
import styles from './main.module.css';
import { db } from '../../firebaseConfig';
import { collection, doc , getDoc, getDocs, addDoc, setDoc, updateDoc, query, where } from 'firebase/firestore';

const CreateGame = ({ onBack, onJoinGame }) => {

    const [errorMessage, setErrorMessage] = useState('');
    const [gameCreated, setGameCreated] = useState(false);
    const [gameCode, setGameCode] = useState('');
    const [gameName, setGameName] = useState('');
    const [gameDescription, setGameDescription] = useState('');


    // Generate a random 4 letter game code when the component mounts.
    useEffect(() => {
        GenerateGameCode();
    }, []);

    useEffect(() => {
        if(gameCreated){
            onJoinGame();
        }
    }, [gameCreated]);

    // Function to generate a random 4 letter game code.
    const GenerateGameCode = () => {
        
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        
        for (let i = 0; i < 4; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }


        console.log('Generated game code:', result);
        CheckGameCode(result);
    }

    const CheckGameCode = async (code) => {
        
        try {
            // Reference to the games collection
            const gamesRef = collection(db, "games");

            // Query to check if the gameCode already exists
            const q = query(gamesRef, where("__name__", "==", code));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                console.log('Game code is already taken.');
                GenerateGameCode();
            } 
            else {
                console.log('Game code is available.');
                setGameCode(code);
            }
        } 
        catch (error) {
            console.error("Error checking game code:", error);
            setErrorMessage('Error checking game code.');
        } 
    }

    const CreateGame = async (e) => {

        e.preventDefault();

        try {
            // Reference to the new game document with ID = gameCode
            const gameDocRef = doc(db, "games", gameCode);

            // Set the game document with the provided details
            await setDoc(gameDocRef, {
                gameName: gameName,
                gameDescription: gameDescription,
                creationDate: new Date()
            });

            // Reference to the players subcollection under this game document
            const playersRef = collection(gameDocRef, "players");

            // Add a placeholder document to the players subcollection
            await setDoc(doc(playersRef, "placeholder_user"), {
                name: "placeholder_user",
                createdAt: new Date()
            });

            console.log('Game created successfully.');
            setGameCreated(true);
        } 
        catch (error) {
            console.error("Error creating game:", error);
        }
    };

    return (
        <div className={styles.background}>
            <h1 className={styles.title}>Create Game</h1>
            <h1 className={styles.subtitle}>GAMECODE: {gameCode}</h1>
            <form className={styles.form} onSubmit={CreateGame}>
                <input
                    type="text"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value.toUpperCase())}
                    placeholder="GAME NAME"
                    maxLength='30'
                    className={styles.input}
                    required
                />
                <textarea
                    type="text"
                    style={{resize: 'none'}}
                    value={gameDescription}
                    onChange={(e) => setGameDescription(e.target.value)}
                    placeholder="DESCRIPTION"
                    maxLength='280'
                    className={styles.input}
                />
                <button type='submit' className={styles.button}>
                    CREATE GAME
                </button>
            </form>
            <button className={styles.button} onClick={onBack}>BACK</button>
        </div>
  );
};

export default CreateGame;