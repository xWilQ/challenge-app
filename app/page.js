"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import styles from './page.module.css';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import ChallengeCard from './Components/ChallengeCard';

export default function Home() {
  const [name, setName] = useState('');
  const [showChallenges, setShowChallenges] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ammountSkipped, setAmmountSkipped] = useState(0);
  const [ammountCompleted, setAmmountCompleted] = useState(0);

  useEffect(() => {
    if (showChallenges) {
      generateChallenges();
    }
  }, [showChallenges]);

  const handleNameSubmit = async (e) => {
    e.preventDefault();
    
    //Check if the name is empty
    if (name.trim() === '') {
      return;
    }
    
    setLoading(true);

    // Check if the user exists
    const userDocRef = doc(db, 'users', name);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // User exists, fetch their challenges
      const userData = userDoc.data();
      setChallenges(userData.challenges);
      setAmmountSkipped(userData.ammountSkipped || 0);
      setAmmountCompleted(userData.ammountCompleted || 0);
    } else {
      // User doesn't exist, generate and save new challenges
      const newChallenges = await generateChallenges();
      await setDoc(userDocRef, { challenges: newChallenges, ammountSkipped: 0, ammountCompleted: 0 });
      setChallenges(newChallenges);
    }

    setLoading(false);
    setShowChallenges(true);
  };

  const generateChallenges = async () => {
    const challengesCollection = collection(db, 'challenges');
    const challengesSnapshot = await getDocs(challengesCollection);
    const allChallenges = challengesSnapshot.docs.map(doc => ({
      ...doc.data(),
      status: 'normal', // Default status
    }));
    const shuffledChallenges = allChallenges.sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffledChallenges;
  };

  const handleSkip = async (challenge) => {
    try {
      // Reference to the user's document
      const userDocRef = doc(db, 'users', name);
  
      // Fetch the current user's data
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
  
      // Mark the challenge as skipped
      const updatedChallenges = userData.challenges.map(c =>
        c.id === challenge.id ? { ...c, status: 'skipped' } : c
      );
  
      // Fetch a new random challenge that is not already in the user's list
      const newChallenge = (await getDocs(collection(db, 'challenges'))).docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter(c => !updatedChallenges.some(rc => rc.id === c.id))
        .sort(() => Math.random() - 0.5)[0];
  
      // Add the new challenge to the user's list
      updatedChallenges.push(newChallenge);
  
      // Update the user's document with the new challenge list and increment the skipped count
      await updateDoc(userDocRef, {
        challenges: updatedChallenges,
        ammountSkipped: ammountSkipped + 1,
      });
  
      // Update ammountSkipped localy
      setAmmountSkipped(ammountSkipped + 1);

      // Update the local state to reflect the skipped challenge and the new challenge
      setChallenges(updatedChallenges);
    } catch (error) {
      console.error('Error handling challenge skip:', error);
    }
  };
    
  
  const handleSubmit = async (challenge, comment, photoURL) => {

    try {
    
      // Reference to the user's document
      const userDocRef = doc(db, 'users', name);
    
      // Fetch the current user's data
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();

      // Update the user's document with the completed challenge status
      await updateDoc(userDocRef, {
        challenges: userData.challenges.map(c =>
        c.id === challenge.id
          ? { ...c, status: 'completed', completedAt: new Date(), comment: comment, photoURL } // Mark challenge as completed
          : c
      ),
        ammountCompleted: ammountCompleted +1, // Increment the completed challenges counter
      });

      // Update ammountCompleted localy
      setAmmountCompleted(ammountCompleted + 1);

      // Update the local state to reflect that the challenge has been completed
      setChallenges(prevChallenges =>
        prevChallenges.map(c =>
          c.id === challenge.id
            ? { ...c, status: 'completed' } // Mark challenge as completed
            : c
        )
      );
    } catch (error) {
      console.error('Error updating challenge completion:', error);
    }
  };
    
  return (
    <div className={styles.container}>
      {!showChallenges ? (
        <div className={styles.form}>
          <h1 className={styles.logo}>Tervetuloa VillaKämppä Haaste kisaan!</h1>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase())}
              placeholder="Syötä nimesi"
              required
              className={styles.input}
            />
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Ladataan' : 'Kirjaudu'}
            </button>
          </form>
        </div>
      ) : (
        <div className={styles.cardsContainer}>
          <h1 className={styles.logo}>Tervetuloa {name.charAt(0).toUpperCase() + name.slice(1)}!</h1>
            <div className={styles.stats}>
              <p> {ammountCompleted} haastetta suoritettu</p>
              <p> {ammountSkipped} haastetta skipattu</p>
            </div>
          {loading ? (
            <p className={styles.loading}>Ladataan haasteita...</p>
          ) : challenges.length > 0 ? (
            challenges.map((challenge, index) => (
              <ChallengeCard
                key={index}
                challenge={challenge}
                onSkip={handleSkip}
                onSubmit={handleSubmit}
              />
            ))
          ) : (
            <p className={styles.noChallenges}>Haasteita ei ollut saatavilla.</p>
          )}
        </div>
      )}
    </div>
  );
}