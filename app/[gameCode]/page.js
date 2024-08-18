import { db } from '../../firebaseConfig';
import { collection, doc , getDoc, getDocs, addDoc, setDoc, updateDoc, query, where } from 'firebase/firestore';
import styles from './page.module.css';

// Function to fetch all possible game codes
export async function generateStaticParams() {
    const gamesCollection = collection(db, "games");
    const gameSnapshots = await getDocs(gamesCollection);

    const paths = gameSnapshots.docs.map((doc) => ({
        gameCode: doc.id.toLowerCase(),
    }));

    return paths;
}

export default async function GamePage({ params }) {
    const { gameCode } = params;
    const gameData = await getGameData(gameCode.toUpperCase()); // Fetch and render the game data

    if (!gameData) {
        return (
            <div>
                <h1>Game Not Found</h1>
            </div>
        );
    }

    const submitUserName = (e) => {
        e.preventDefault();

        const username = e.target.value.toUpperCase();

        // Save username to local storage
        localStorage.setItem('username', username);

        console.log('Joiging game as ', username);
    }

    return (
        <div>
            <form>
                <h1 className={styles.title}>{gameData.gameName}</h1>
                <p className={styles.gameDescription}>{gameData.gameDescription}</p>
                <div className={styles.subtitle2}>
                    <p>ENTER USERNAME</p>
                </div>
                <input
                    type="text"
                    /*value={e.target.value}*/
                    /*onChange={(e) => onNameChange(e)}*/
                    placeholder="USERNAME"
                    maxLength='12'
                    required
                    className={styles.input}
                />
                <button type="submit" className={styles.button}>JOIN GAME</button>
            </form>
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
