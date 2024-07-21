"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import styles from './page.module.css';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export default function Omahaaste() {

    const [submitted, setSubmitted] = useState(false);
    const [challengeName, setChallengeName] = useState('');
    const [challengeDescription, setChallengeDescription] = useState('');

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        //TODO: add id numbering to the challenges

        const docRef = await addDoc(collection(db, "haasteet"), {
            name: challengeName,
            description: challengeDescription,
            uniqueness: 0,
        });

        setSubmitted(true);
        setChallengeName('');
        setChallengeDescription('');
    };

    return (
        <div className={styles.form}>
            
            <h1 className={styles.logo}>Tervetuloa VillaKämppä Haaste kisaan!</h1>
            <h2 className={styles.logo}>Luo uusi haaste</h2>
            
            {!submitted ? (
            
            <form onSubmit={handleFormSubmit}>
                <input className={styles.name}
                    type="text"
                    value={challengeName}
                    onChange={(e) => setChallengeName(e.target.value)}
                    placeholder="Haasteen nimi"
                    required
                />
                <textarea className={styles.description}
                    type="text"
                    value={challengeDescription}
                    onChange={(e) => setChallengeDescription(e.target.value)}
                    placeholder="Haasteen kuvaus"
                    required
                />
                <button type="submit" className={styles.button}>Lähetä</button>
            </form>
            ):(
            <>
                <h2 className={styles.logo}>Kiitos haasteen luomisesta!</h2>
                <button onClick={() => setSubmitted(false)} className={styles.button}>Luo uusi haaste</button>
            </>
            )}
        </div>
    );
}