import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import api from 'lib/api';

import BackwardPng from 'assets/img/backward.png';
import Link from 'next/link';

export default function Announcement({ announcements }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  return (
    <div>
      <Head>
        <title>Announcement</title>
        <meta name="description" content="Announcement" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='page'>
        <div className='page-header'>
          <img className="size-20" src={BackwardPng.src} onClick={() => router.back()} />
          <h2 className='title'>Announcement</h2>
        </div>

        <div className='page-content'>
          <ul className='announcements-items'>
            {announcements.map(item =>
              <li key={item.id}>
                <img className='featured-img' src={item.featuredImage ? item.featuredImage?.node.mediaItemUrl : 'book_cover.png'} alt="ann" />
                <div className='item-info'>
                  <div className='mb-10'>{item.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <p style={{ fontSize: 12 }}>{item.announcementCategories.nodes.map(v => v.name).join(', ')}</p>
                    <p style={{ fontSize: 12 }} className='ml-10'>{new Date(item.date).toLocaleDateString()}</p>
                  </div>
                </div>
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}


export async function getStaticProps() {
  const announcements = await api.announcement.get();

  return {
    props: {
      announcements: announcements?.data.announcements.nodes
    },
    revalidate: 10
  }
}
