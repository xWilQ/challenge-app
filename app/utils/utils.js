import { db } from '../../firebaseConfig';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';

// Fetch initial challenges for a new user or existing user
export const fetchInitialChallenges = async (userName) => {
  try {
    const userDocRef = doc(db, 'users', userName);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      // User exists, return existing challenges
      const userData = userDoc.data();
      return userData.challenges || [];
    } else {
      // User does not exist, create a new user and assign initial challenges
      const challengesCollection = collection(db, 'challenges');
      const challengesSnapshot = await getDocs(challengesCollection);
      const allChallenges = challengesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

      // Shuffle and select 5 challenges
      const shuffledChallenges = allChallenges.sort(() => Math.random() - 0.5).slice(0, 5);

      // Create a new user document with these challenges
      await setDoc(userDocRef, {
        challenges: shuffledChallenges,
        ammountCompleted: 0,
        ammountSkipped: 0
      });

      return shuffledChallenges;
    }
  } catch (error) {
    console.error('Error fetching initial challenges:', error);
    throw error;
  }
};

// Fetch a new challenge for skip or completion
export const fetchNewChallenge = async (userChallenges) => {
  try {
    const challengesCollection = collection(db, 'challenges');
    const challengesSnapshot = await getDocs(challengesCollection);
    const allChallenges = challengesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    // Filter out challenges already in user's list and those with UNIQUENESS <= 0
    const validChallenges = allChallenges.filter(
      c => !userChallenges.some(rc => rc.id === c.id) && c.uniqueness > 0
    );

    // Select a random challenge
    const newChallenge = validChallenges.sort(() => Math.random() - 0.5)[0];

    return newChallenge;
  } catch (error) {
    console.error('Error fetching new challenge:', error);
    throw error;
  }
};

// Handle skipping a challenge
export const handleSkip = async (userName, challenge, setChallenges, setAmmountSkipped) => {
  try {
    const userDocRef = doc(db, 'users', userName);

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User does not exist');
      }

      const userData = userDoc.data();
      const updatedChallenges = userData.challenges.map(c =>
        c.id === challenge.id ? { ...c, status: 'skipped' } : c
      );

      // Fetch a new challenge
      const newChallenge = await fetchNewChallenge(updatedChallenges);

      // Update the document with the new challenge and increment skipped count
      transaction.update(userDocRef, {
        challenges: [...updatedChallenges, newChallenge],
        ammountSkipped: userData.ammountSkipped + 1
      });

      // Update the UNIQUENESS value for the skipped challenge
      const challengeRef = doc(db, 'challenges', challenge.id);
      transaction.update(challengeRef, {
        uniqueness: challenge.uniqueness - 1
      });
    });

    // Update local state
    setAmmountSkipped(prev => prev + 1);
    setChallenges(prevChallenges =>
      prevChallenges.map(c =>
        c.id === challenge.id
          ? { ...c, status: 'skipped' }
          : c
      )
    );
  } catch (error) {
    console.error('Error handling challenge skip:', error);
  }
};

// Handle completion of a challenge
export const handleCompletion = async (userName, challenge, comment, photoURL, setChallenges, setAmmountCompleted) => {
  try {
    const userDocRef = doc(db, 'users', userName);

    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      if (!userDoc.exists()) {
        throw new Error('User does not exist');
      }

      const userData = userDoc.data();
      const updatedChallenges = userData.challenges.map(c =>
        c.id === challenge.id
          ? { ...c, status: 'completed', completedAt: new Date(), comment, photoURL }
          : c
      );

      // Update the document with the completed challenge and increment completed count
      transaction.update(userDocRef, {
        challenges: updatedChallenges,
        ammountCompleted: userData.ammountCompleted + 1
      });

      // Fetch a new challenge
      const newChallenge = await fetchNewChallenge(updatedChallenges);

      // Add new challenge to the user's list
      transaction.update(userDocRef, {
        challenges: [...updatedChallenges, newChallenge]
      });

      // Update the UNIQUENESS value for the completed challenge
      const challengeRef = doc(db, 'challenges', challenge.id);
      transaction.update(challengeRef, {
        uniqueness: challenge.uniqueness - 1
      });
    });

    // Update local state
    setAmmountCompleted(prev => prev + 1);
    setChallenges(prevChallenges =>
      prevChallenges.map(c =>
        c.id === challenge.id
          ? { ...c, status: 'completed' }
          : c
      )
    );
  } catch (error) {
    console.error('Error handling challenge completion:', error);
  }
};