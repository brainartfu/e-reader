import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession } from "next-auth/react"
import { useRouter } from 'next/router';
import api from 'lib/api';

import BackwardPng from 'assets/img/backward.png';

export default function Information(props) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const menus = [
    { title: "Contact Us", icon: 'profile_l8.png', link: '/contact-us', needToken: false },
    { title: "Terms", icon: 'profile_l8.png', link: '/terms', needToken: false },
    { title: "Privacy Policy", icon: 'profile_l8.png', link: '/privacy-policy', needToken: false },
    { title: "Community Guideline", icon: 'profile_l8.png', link: '/guideline', needToken: false },
  ];

  return (
    <div>
      <Head>
        <title>Information</title>
        <meta name="description" content="Information" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='page'>
        <div className='page-header'>
          <img className="size-20" src={BackwardPng.src} onClick={() => router.back()} />
          <h2 className='title'>INFORMATION</h2>
        </div>

        <div className='page-content'>
          <div className="contents_page_chapter_menus profile_page_linking custom_padding mt-20">
            <ul>
              {menus.map((menu, index) => {
                if (menu.needToken && sessionStatus === "authenticated" || !menu.needToken) {
                  return <li key={index}>
                    <a href={menu.link}>
                      <span className="cpchapter_left">
                        {/* <span className="cpcphapter_pimg"><img src={menu.icon} alt="profile-menu-icon" /></span> */}
                        <span className="cpchapter_content pchapter_content">
                          <span>{menu.title}</span>
                          {menu.subtitle && <span className="pchapter_content_des">{menu.subtitle}</span>}
                        </span>
                      </span>
                      <span className="cpchapter_right"><img src="Arrow_right_20.png" alt="images" /></span>
                    </a>
                  </li>
                }
              })}

              <li>
                <a href="#" style={{ pointerEvents: 'none', height: 48 }}>
                  <span className="cpchapter_left">
                    {/* <span className="cpcphapter_pimg"><img src="profile_l8.png" alt="profile-menu-icon" /></span> */}
                    <span className="cpchapter_content pchapter_content">
                      <span>App Version</span>
                    </span>
                  </span>
                  <span className="cpchapter_right">3.31.0</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}