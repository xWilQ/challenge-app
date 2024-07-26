import { db } from '../../firebaseConfig';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';

export const fetchChallenges = async (name) => {

    try {
        // Ensure name is valid
        if (!name || name.trim() === '') {
            throw new Error('Invalid user name');
        }

        const userDocRef = doc(db, 'users', name);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
            throw new Error('User not found');
        }

        const challengesCollection = collection(db, 'users', name, 'challenges');
        const challengesSnapshot = await getDocs(challengesCollection);
        const challenges = challengesSnapshot.docs.map(doc => doc.data());

        console.log("Im Here");

        return challenges;
    } 
    catch (error) {
        console.error(error);
    }
};