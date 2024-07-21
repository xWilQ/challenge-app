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
    // Retrieve the name from local storage when the component mounts
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setName(storedName);
      setShowChallenges(true);
    }
  }, []);

  useEffect(() => {
    if (showChallenges) {
      fetchChallenges();
    }
  }, [showChallenges]);

  const handleNameSubmit = (e) => {
    
    e.preventDefault();
    
    if (name.trim() === '') {
      return;
    }
    
    // Store the name in local storage
    localStorage.setItem('userName', name);
    setShowChallenges(true);
  };

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', name);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.exists() ? userDoc.data() : { challenges: [], ammountCompleted: 0, ammountSkipped: 0 };

      // Set state for skipped and completed challenges
      setAmmountSkipped(userData.ammountSkipped || 0);
      setAmmountCompleted(userData.ammountCompleted || 0);

      // If the user has challenges saved, use them; otherwise, fetch new challenges
      if (userData.challenges.length > 0) {
        setChallenges(userData.challenges);
      } else {
        const challengesCollection = collection(db, 'challenges');
        const challengesSnapshot = await getDocs(challengesCollection);
        const allChallenges = challengesSnapshot.docs.map(doc => doc.data());

        // Shuffle the challenges array and select 10
        const shuffledChallenges = allChallenges.sort(() => Math.random() - 0.5).slice(0, 10);
        setChallenges(shuffledChallenges);
        // Save the initial challenges to the user's document
        await setDoc(userDocRef, {
          ...userData,
          challenges: shuffledChallenges,
        });
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
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