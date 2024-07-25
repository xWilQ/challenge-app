"use client";
import React, { useState, useEffect } from 'react';
import { db } from './../firebaseConfig';
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
        <div className={styles.container}>
            
            <div className={styles.logo}>
                <h1>Luo oma haaste <br></br> Villa Kämppä <br></br> viikonlopulle!</h1>
            </div>

            {!submitted ? (
            <div className={styles.form}>
                <form onSubmit={handleFormSubmit}>

                    <div className={styles.rules}>
                        <p>1. Haasteen tulee olla hauska ja turvallinen!</p>
                        <p>2. Ei aiheuteta kenellekkään pahaa mieltä!</p>
                        <p>3. Muista että tämä haaste voi sattua juuri sinulle, mieti läpi mitä olet itse valmis tekemään.</p>
                        <br></br>
                        <p><strong>Esimerkki haaste:</strong></p> 
                        <p><strong>Nimi:</strong> Yhteislaulu!</p>
                        <p><strong>Selitys:</strong> Aloita laulu ja saa ainakin kaksi muuta pelaajaa mukaan laulamaan</p>
                    </div>
                    
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
                        placeholder="Haasteen selitys"
                        required
                    />
                    <button type="submit" className={styles.button}>Lähetä</button>
                </form>
            </div>
            ):(
            <>
                <h2 className={styles.logo}>Kiitos haasteen luomisesta!</h2>
                <button onClick={() => setSubmitted(false)} className={styles.button}>Luo uusi haaste</button>
            </>
            )}
        </div>
    );
}