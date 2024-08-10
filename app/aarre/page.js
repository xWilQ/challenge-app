"use client";
import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import { db } from '../../firebaseConfig';
import { collection, doc , getDocs, addDoc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { info } from 'sass';

export default function Home() {
  
    const [input, setInput] = useState();

    return (
        <div className={styles.container}>
        </div>
    );
}