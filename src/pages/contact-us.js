import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import api from 'lib/api';

import BackwardPng from 'assets/img/backward.png';
import Link from 'next/link';

export default function ContactUs(props) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Contact Us</title>
        <meta name="description" content="Contact Us" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='page'>
        <div className='page-header'>
          <img className="size-20" src={BackwardPng.src} onClick={() => router.back()} />
          <h2 className='title'>Contact Us</h2>
        </div>

        <div className='page-content'>
          <p className="mb-20">For Support & General Inquiries:</p>
          <Link href="mailto:support@ricecakes.io">
            <a className='text-white'>support@ricecakes.io</a>
          </Link>
        </div>
      </main>
    </div>
  )
}