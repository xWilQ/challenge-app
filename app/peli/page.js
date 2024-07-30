"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import styles from './page.module.css';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import ChallengeCard from '../components/challengeCard';

export default function Home() {
  const [name, setName] = useState('');
  const [showChallenges, setShowChallenges] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ammountSkipped, setAmmountSkipped] = useState(0);
  const [ammountCompleted, setAmmountCompleted] = useState(0);

  //const cardColors = ['#9b5de5', '#f15bb5', '#0d3b66'];
  //const cardColors = ['#390099', '#9E0059', '#FF0054', '#FF5400', '#FFBD00'];
  const cardColors = ['#E30401', '#47B3FD', '#FF0054', '#FF5400', '#FFBD00'];
  //const cardColors = ['#808080'];

  useEffect(() => {
    // Retrieve the name from local storage when the component mounts
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setName(storedName);
      fetchChallenges(storedName);
    }
  }, []);

  /*useEffect(() => {
    if (showChallenges) {
      fetchChallenges();
    }
  }, [showChallenges]);*/

  const handleNameSubmit = async (e) => {
    
    e.preventDefault();
    
    if (name.trim() === '') {
      return;
    }

    const processedName = name.replace(/\s/g, "").trim().toLowerCase();
    
    setName(processedName);
    // Store the name in local storage
    localStorage.setItem('userName', processedName);
    // Create a new user document if it does not exist
    const userDocRef = doc(db, 'users', processedName);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        challenges: [],
        ammountSkipped: 0,
        ammountCompleted: 0,
      });
      console.log('User document created:', processedName);
    }
    //setShowChallenges(true);
    fetchChallenges(processedName);
  };

  const fetchChallenges = async (name) => {
    console.log('Fetching challenges...');
    setLoading(true);
    try {
      const userDocRef = doc(db, 'users', name);
      const userDoc = await getDoc(userDocRef);
      let userData = null;
      
      console.log('trying to fetch user data', name);
      
      if (userDoc.exists()) {
        console.log('User exists:', name);
        userData = userDoc.data();
        setAmmountSkipped(userData.ammountSkipped || 0);
        setAmmountCompleted(userData.ammountCompleted || 0);
        setChallenges(userData.challenges || []);
      } else {
        // User does not exist, show form for entering new name
        console.log('User does not exist:', name);
        setName('');
        setLoading(false);
        setShowChallenges(false);
        return; // Exit the function early
      }

      // Set state for skipped and completed challenges
      setAmmountSkipped(userData.ammountSkipped || 0);
      setAmmountCompleted(userData.ammountCompleted || 0);

      // If the user has challenges saved, use them; otherwise, fetch new challenges
      if (userData.challenges.length > 0) {
        setChallenges(userData.challenges);
        console.log('Challenges fetched from user data');
      } else {
        
        console.log('User had no challenges, fetching new ones');

        const challengesCollection = collection(db, 'challenges');
        const challengesSnapshot = await getDocs(challengesCollection);
        const allChallenges = challengesSnapshot.docs.map(doc => doc.data());

        // Shuffle the challenges array and select 10
        const shuffledChallenges = allChallenges.sort(() => Math.random() - 0.5).slice(0, 5);
        setChallenges(shuffledChallenges);
        // Save the initial challenges to the user's document
        await setDoc(userDocRef, {
          ...userData,
          challenges: shuffledChallenges,
        });
      }
      setShowChallenges(true);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      console.log('done fetcing challenges');
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
    
  const handleSubmit = async (challenge, comment, photoStatus) => {
    try {
      const userDocRef = doc(db, 'users', name);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
  
      // Update the user's document with the completed challenge status
      const updatedChallenges = userData.challenges.map(c =>
        c.id === challenge.id
          ? { ...c, status: 'completed', completedAt: new Date(), comment: comment, photoStatus } // Mark challenge as completed
          : c
      );
      
      // Update ammountCompleted locally
      setAmmountCompleted(ammountCompleted + 1);

      // Limit the number of challenges that can be completed to 15
      if (ammountCompleted < 10) {
        
        // Fetch a new random challenge that is not already in the user's list
        const newChallenge = (await getDocs(collection(db, 'challenges'))).docs
          .map(doc => ({ ...doc.data(), id: doc.id }))
          .filter(c => !updatedChallenges.some(rc => rc.id === c.id))
          .sort(() => Math.random() - 0.5)[0];
          
          // Add the new challenge to the user's list
          updatedChallenges.push(newChallenge);
      }
      
      // Update the user's document with the new challenge list and increment the completed count
      await updateDoc(userDocRef, {
        challenges: updatedChallenges,
        ammountCompleted: ammountCompleted + 1,
      });
  
      // Update the local state to reflect the completed challenge and the new challenge
      setChallenges(updatedChallenges);
    } catch (error) {
      console.error('Error updating challenge completion:', error);
    }
  };

  const sortedChallenges = challenges.sort((a, b) => {
    // Define the order of statuses and assign 'pending' as the default status for challenges without a status
    const statusOrder = { 'pending': 1, 'skipped': 2, 'completed': 3 };
    const statusA = a.status || 'pending';
    const statusB = b.status || 'pending';
    
    return statusOrder[statusA] - statusOrder[statusB];
  });

  return (
    <div className={styles.container}>
      {!showChallenges ? (
        <div className={styles.form}>
          <form onSubmit={handleNameSubmit}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <div className={styles.stats}>
            <h1 className={styles.welcome}>Tervetuloa {name.charAt(0).toUpperCase() + name.slice(1)}!</h1>
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
                username={name}
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