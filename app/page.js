"use client";
import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import styles from './page.module.css';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import ChallengeCard from './Components/ChallengeCard';

export default function Home() {
  const [name, setName] = useState('');
  const [showChallenges, setShowChallenges] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showChallenges) {
      fetchChallenges();
    }
  }, [showChallenges]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    setShowChallenges(true);
  };

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const challengesCollection = collection(db, 'challenges');
      const challengesSnapshot = await getDocs(challengesCollection);
      const allChallenges = challengesSnapshot.docs.map(doc => doc.data());

      // Shuffle the challenges array and select 10
      const shuffledChallenges = allChallenges.sort(() => Math.random() - 0.5).slice(0, 10);
      setChallenges(shuffledChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async (challenge) => {
    const newChallenges = challenges.filter(c => c !== challenge);
    const remainingChallenges = (await getDocs(collection(db, 'challenges'))).docs.map(doc => doc.data()).filter(c => !newChallenges.includes(c));
    const newChallenge = remainingChallenges.sort(() => Math.random() - 0.5)[0];
    newChallenges.push(newChallenge);

    await addDoc(collection(db, 'skips'), {
      user: name,
      skippedChallenge: challenge,
      timestamp: new Date(),
    });

    setChallenges(newChallenges);
  };

  const handleSubmit = async (challenge, comment) => {
    await addDoc(collection(db, 'completions'), {
      user: name,
      completedChallenge: challenge,
      comment: comment,
      timestamp: new Date(),
    });

    setChallenges(prevChallenges => prevChallenges.filter(c => c !== challenge));
  };

  return (
    <div className={styles.container}>
      {!showChallenges ? (
        <form onSubmit={handleNameSubmit} className={styles.form}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className={styles.input}
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Loading...' : 'Start'}
          </button>
        </form>
      ) : (
        <div className={styles.cardsContainer}>
          {loading ? (
            <p className={styles.loading}>Loading challenges...</p>
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
            <p className={styles.noChallenges}>No challenges available.</p>
          )}
        </div>
      )}
    </div>
  );
}