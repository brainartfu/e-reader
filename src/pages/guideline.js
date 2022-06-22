import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import api from 'lib/api';

import BackwardPng from 'assets/img/backward.png';
import Link from 'next/link';

export default function Guideline(props) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Community Guideline</title>
        <meta name="description" content="Community Guideline" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='page'>
        <div className='page-header'>
          <img className="size-20" src={BackwardPng.src} onClick={() => router.back()} />
          <h2 className='title'>Community Guideline</h2>
        </div>

        <div className='page-content'>
          <p>Community Guideline content should be replaced.</p>
        </div>
      </main>
    </div>
  )
}