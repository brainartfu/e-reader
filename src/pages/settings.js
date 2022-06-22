import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import api from 'lib/api';
import { signOut } from "next-auth/react";

import BackwardPng from 'assets/img/backward.png';
import Link from 'next/link';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Settings(props) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = () => {
    if (sessionStatus === 'authenticated') {
      if (password !== "" && password === confirmPassword) {
        api.user.setPassword(session?.user.id, password, session?.user.accessToken).then(res => {
          toast.success('Password has been changed.');
          router.push('/profile');
        });
      } else {
        toast.error('Password is wrong!');
      }
    }
  }

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      api.user.get(session?.user.id, session?.user.accessToken).then(res => {
        setUsername(res.data.user.name);
      });
    }
  }, [sessionStatus]);

  if (sessionStatus !== 'authenticated') {
    return <div style={{ textAlign: 'center', color: 'grey', marginTop: 150 }}>You not allowed to access this page.</div>;
  }

  return (
    <div>
      <Head>
        <title>Settings</title>
        <meta name="description" content="Settings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='page'>
        <div className='page-header'>
          <img className="size-20" src={BackwardPng.src} onClick={() => router.back()} />
          <h2 className='title'>Settings</h2>
        </div>

        <div className='page-content'>
          <div className='setting-row'>
            <div>Username</div>
            <div>{username}</div>
          </div>
          <div className='setting-row'>
            <div>Password</div>
            <div><input type="password" value={password} onChange={e => setPassword(e.target.value)} /></div>
          </div>
          <div className='setting-row'>
            <div>Confirm</div>
            <div><input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} /></div>
          </div>
          <div className='setting-row'>
            <button onClick={handleSubmit}>Submit</button>
          </div>
          {/* <div className='setting-row'>
            <button onClick={handleSignOut}>Log out</button>
          </div> */}
        </div>
      </main>
    </div>
  )
}