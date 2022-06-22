import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import api from 'lib/api';

import BackwardPng from 'assets/img/backward.png';
import Link from 'next/link';

export default function PrivacyPolicy({ policy }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Privacy Policy</title>
        <meta name="description" content="Privacy Policy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='page'>
        <div className='page-header'>
          <img className="size-20" src={BackwardPng.src} onClick={() => router.back()} />
          <h2 className='title'>Privacy Policy</h2>
        </div>

        <div className='page-content'>
          <div className='text-justify' dangerouslySetInnerHTML={{ __html: policy }}></div>
        </div>
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const policy = await api.policy.get();

  return {
    props: {
      policy: policy?.data?.page?.content || "No data"
    },
    revalidate: 10
  }
}
