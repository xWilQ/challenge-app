import React, { useState } from 'react';
import styles from './main.module.css';

const JoinGame = ({ onCreateGame }) => {

    const [gameCode, setGameCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [gameFound, setGameFound] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleSubmitGameCode = (e) => {
        e.preventDefault();

        if (gameCode.trim() === '') {
            console.log('Game code is empty');
            return;
        }

        // Remove all white spaces and convert to lowercase, save game code to local storage.
        const processedCode = gameCode.replace(/\s/g, "").trim().toLowerCase();
        setGameCode(processedCode);
        localStorage.setItem('gameCode', processedCode);

        // Check if game code exists in database
        handleJoinGame();
    }

    const handleJoinGame = async () => {
        
        setLoading(true);
        const gameCode = localStorage.getItem('gameCode');
        
        if (gameCode) {
            
            const gameRef = doc(db, "games", gameCode);
            const gameSnap = await getDoc(gameRef);
            
            if (gameSnap.exists()) {
                setGameFound(True);
                console.log("Game data:", gameSnap.data());
                setLoading(false);
            }
            else {
            setGameFound(false);
            setLoading(false);
            setErrorMessage('No game found with that code, try again with another code or create a new game.');
            console.log("No such document!");
        }
        }
    }
    
    return (
        <div className={styles.form}>
            <form onSubmit={handleSubmitGameCode}>
                <h1>JOIN A GAME</h1>
                <input
                    type="text"
                    value={gameCode}
                    onChange={(e) => setGameCode(e.target.value)}
                    placeholder="ENTER 4 LETTER CODE"
                    required
                    className={styles.input}
                />
                {errorMessage && <p>{errorMessage}</p>}
                <button type="submit" className={styles.button} disabled={loading}>
                    {loading ? 'LOADING' : 'PLAY'}
                </button>
            </form>
            <h1>OR</h1>
            <button onClick={onCreateGame} className={styles.button}>CREATE GAME</button>
        </div>
    );
};

export default JoinGame;