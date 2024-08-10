import React, { useState, useEffect } from 'react';
import styles from './main.module.css';

const CreateGame = () => {

    const [gameName, setGameName] = useState('');

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Create Game</h1>
            <form className={styles.form}>
                <p>NAME</p>
                <input
                    type="text"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder="ENTER 4 LETTER CODE"
                    required
                    className={styles.input}
            />
            </form>
        </div>
  );
};

export default CreateGame;