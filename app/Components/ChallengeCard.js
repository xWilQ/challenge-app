import React, { useState, useEffect } from 'react';
import styles from './challengeCard.module.css';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes } from 'firebase/storage';
import { collection } from 'firebase/firestore';

const ChallengeCard = ({ challenge, onSkip, onSubmit, backgroundColor, ammountSkipped, username, cardOpen}) => {
  const [isOpen, setOpen] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [comment, setComment] = useState('');
  const [localAmmountSkipped, setLocalAmmountSkipped] = useState(0);
  const [isLongDescrition, setIsLongDescrition] = useState(false);
  const allowedSkips = 3;

  //const borderStyles = ['4px solid orange', '4px solid yellow', '4px solid blue'];

  useEffect(() => {
    setLocalAmmountSkipped(ammountSkipped);
  }, [ammountSkipped]);

  const handleCancel = () => {
    setOpen(false);
    setConfirmSkip(false);
    setIsSubmitting(false);
    setComment('');
  };

  const handleSkip = () => {
    setConfirmSkip(true);
  };

  const confirmSkipAction = () => {
    setOpen(false);
    setConfirmSkip(false);
    onSkip(challenge);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
  };

  const handleCommentChange = (event) => {
    setComment(event.target.value);
  };
  
  const handlePhotoChange = (event) => {
    setPhoto(event.target.files[0]);
  };

  const handleSubmitComment = async () => {
    //let photoURL = '';
    let photoStatus = false;
    if (photo) {
      const photoRef = ref(storage, `photos/${username}/${photo.name}`);
      const snapshot = await uploadBytes(photoRef, photo);
      
      photoStatus = true;
      //photoURL = await getDownloadURL(snapshot.ref);
    }

    onSubmit(challenge, comment, photoStatus);
    setIsSubmitting(false);
    setOpen(false);
    setComment('');
    setPhoto(null);
  };

  const getCardStyle = () => {
    if (challenge.status === 'completed') return styles.completedCard;
    if (challenge.status === 'skipped') return styles.skippedCard;
    return {};
  };

  //const randomBorderStyle = borderStyles[Math.floor(Math.random() * borderStyles.length)];
  const cardStyle = getCardStyle();
  //const cardBackgroundStyle = challenge.status ? {} : { backgroundColor, border: randomBorderStyle };
  const cardBackgroundStyle = challenge.status ? {} : { backgroundColor};

  //Check if the description is longer than 100 characters
  
  useEffect(() => {
    if (challenge.description.slice(0, 100) !== challenge.description) {
      setIsLongDescrition(true);
    }
  }, [challenge.description]);

  return (
    <div
    className={`${styles.card} ${cardStyle}`}
      style={cardBackgroundStyle}
    >
      <h2 className={styles.cardTitle}>{challenge.title}</h2>
      <h2 className={styles.cardStatus}>{challenge.status}</h2>
      {isLongDescrition && !isOpen ? (
          <p className={styles.cardDescription}>{challenge.description.slice(0 , 100)}...</p>
        ):(
          <p className={styles.cardDescription}>{challenge.description}</p>
        )}
      {!isOpen && !isSubmitting && !challenge.status &&
      <>
       <button className={styles.chooseButton} onClick={() => setOpen(true)}>Avaa</button>
      </>
      }
      {isOpen && !isSubmitting && (
        <div className={styles.actions}>
          {confirmSkip ? (
            <div className={styles.confirmation}>
              {localAmmountSkipped > allowedSkips - 1 ? (
                <>
                <p>Olet käyttänyt kaikki skippisi</p>
                <button onClick={() => { setConfirmSkip(false); setOpen(false); }} className={styles.backButton}>Takaisin</button>
                </>
              ):(
                <>
                <p>Oletko varma että haluat skipata tämän haasteen?</p>
                <p>Sinulla on {allowedSkips - ammountSkipped} skippiä jäljellä</p>
                <button onClick={confirmSkipAction} className={styles.skipButton}>Kyllä</button>
                <button onClick={() => { setConfirmSkip(false); setOpen(false); }} className={styles.backButton}>Takaisin</button>
                </>
              )}
            </div>
          ) : (
            <div className={styles.buttonGroup}>
              <button onClick={handleSkip} className={styles.skipButton}>Skip</button>
              <button onClick={handleCancel} className={styles.backButton}>Takaisin</button>
              <button onClick={handleSubmit} className={styles.submitButton}>Valmis</button>
            </div>
          )}
        </div>
      )}
      {isSubmitting && (
        <div className={styles.commentSection}>
          <textarea
            className={styles.commentInput}
            value={comment}
            onChange={handleCommentChange}
            placeholder="Kirjoita kommentti..."
          />
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className={styles.photoInput}
            placeholder='Lisää kuva'
          />
          <div className={styles.commentActions}>
            <button onClick={handleCancel} className={styles.backButton}>Takaisin</button>
            <button onClick={handleSubmitComment} className={styles.submitButton}>Lähetä</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeCard;