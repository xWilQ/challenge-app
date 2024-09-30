import { db } from '../../firebaseConfig';
import { collection, doc , getDoc, getDocs, addDoc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import styles from './page.module.css';
import Link from 'next/link'
import MainScene from '../components/MainScene';

// Function to fetch all possible game codes
/*export async function generateStaticParams() {
    const gamesCollection = collection(db, "games");
    const gameSnapshots = await getDocs(gamesCollection);

    const paths = gameSnapshots.docs.map((doc) => ({
        gameCode: doc.id.toLowerCase(),
    }));

    return paths;
}*/

export default async function GamePage({ params }) {
    const { gameCode } = params;
    const gameData = await getGameData(gameCode.toUpperCase()); // Check if there is a game with the given game code and get the game data.

    //Check if the game exists
    if (!gameData) {
        return (
            <div className={styles.container}>
                <div className={styles.background}>
                    <h1>NO GAME FOUND</h1>
                    <Link href='/'>
                        <button className={styles.button}>BACK</button>
                    </Link>
                </div>
            </div>
        );
    }

    // If the game exists
    return (
        <div className={styles.container}>
            <MainScene 
                gameData={gameData}
                gameCode={gameCode.toUpperCase()}
            />
        </div>
    );
}

async function getGameData(gameCode) {
    const gameCodeUpper = gameCode;
    const gameDocRef = doc(db, "games", gameCodeUpper);
    const gameSnap = await getDoc(gameDocRef);

    if (!gameSnap.exists()) {
        return null;
    }

    return gameSnap.data();
}
