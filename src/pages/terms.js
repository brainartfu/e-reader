import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import api from 'lib/api';

import BackwardPng from 'assets/img/backward.png';
import Link from 'next/link';

export default function Terms(props) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Terms</title>
        <meta name="description" content="Terms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='page'>
        <div className='page-header'>
          <img className="size-20" src={BackwardPng.src} onClick={() => router.back()} />
          <h2 className='title'>Terms</h2>
        </div>

        <div className='page-content'>
          <p>Terms and conditions content should be replaced.</p>
        </div>
      </main>
    </div>
  )
}