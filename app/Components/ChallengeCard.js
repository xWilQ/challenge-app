import React, { useState, useEffect } from 'react';
import styles from './ChallengeCard.module.css';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ChallengeCard = ({ challenge, onSkip, onSubmit, backgroundColor }) => {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [comment, setComment] = useState('');
  const [timer, setTimer] = useState(null);

  //const borderStyles = ['4px solid orange', '4px solid yellow', '4px solid blue'];

  useEffect(() => {
    return () => clearTimeout(timer); // Clean up the timer on component unmount
  }, [timer]);

  const handleTouchStart = () => {
    const newTimer = setTimeout(() => {
      setIsLongPressed(true);}
      , 500); // Adjust the duration of the long press as needed (500ms in this case)
    setTimer(newTimer);
  };

  const handleTouchEnd = () => {
    clearTimeout(timer);
    setTimer(null);
  };

  const handleCancel = () => {
    setIsLongPressed(false);
    setConfirmSkip(false);
    setIsSubmitting(false);
    setComment('');
    clearTimeout(timer);
  };

  const handleSkip = () => {
    setConfirmSkip(true);
  };

  const confirmSkipAction = () => {
    setIsLongPressed(false);
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
    let photoURL = '';

    if (photo) {
      const photoRef = ref(storage, `photos/${photo.name}`);
      const snapshot = await uploadBytes(photoRef, photo);
      photoURL = await getDownloadURL(snapshot.ref);
    }

    onSubmit(challenge, comment, photoURL);
    setIsSubmitting(false);
    setIsLongPressed(false);
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

  return (
    <div
    className={`${styles.card} ${cardStyle}`}
      style={cardBackgroundStyle}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <h2 className={styles.cardTitle}>{challenge.name}</h2>
      <p className={styles.cardDescription}>{challenge.description}</p>
      {!isLongPressed && !isSubmitting && !challenge.status &&
      <>
       <button className={styles.chooseButton} onClick={() => setIsLongPressed(true)}>Avaa🎯</button>
      </>
      }
      {isLongPressed && !isSubmitting && (
        <div className={styles.actions}>
          {confirmSkip ? (
            <div className={styles.confirmation}>
              <p>Oletko varma että haluat skipata tämän haasteen?</p>
              <button onClick={confirmSkipAction} className={styles.skipButton}>Kyllä</button>
              <button onClick={() => setConfirmSkip(false)} className={styles.backButton}>Takaisin</button>
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