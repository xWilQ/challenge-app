import React, { useState, useEffect } from 'react';
import styles from './ChallengeCard.module.css';

const ChallengeCard = ({ challenge, onSkip, onSubmit }) => {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [confirmSkip, setConfirmSkip] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [comment, setComment] = useState('');
  const [timer, setTimer] = useState(null);

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

  const handleSubmitComment = () => {
    onSubmit(challenge, comment);
    setIsSubmitting(false);
    setIsLongPressed(false);
    setCompleted(true);
    setComment('');
  };

  const getCardStyle = () => {
    if (challenge.status === 'completed') return styles.completedCard;
    if (challenge.status === 'skipped') return styles.skippedCard;
    return styles.card;
  };

  return (
    <div
    className={`${styles.card} ${getCardStyle()}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <h2 className={styles.cardTitle}>{challenge.name}</h2>
      {!isLongPressed && !isSubmitting && <p className={styles.cardDescription}>{challenge.description}</p>}
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