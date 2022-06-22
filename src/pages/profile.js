import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { gql } from '@apollo/client';
import { initializeApollo } from 'lib/apollo-client';
import { getSession, useSession } from "next-auth/react"
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router'

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import jwt_decode from "jwt-decode";

import ProfileHeader from '../components/profile-header';
import Footer from '../components/footer';
import styles from '../styles/Home.module.css'
import api from 'lib/api';
import LoginModal from 'components/LoginModal';
import Loader from 'components/common/loader';

export default function Profile({ page }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState();
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const menus = [
    { title: "Join our Discord", icon: 'profile_l8.png', link: 'https://discord.com', needToken: false },
    // { title: "Inbox", icon: 'profile_l1.png', link: '', needToken: false },
    // { title: "Levels", icon: 'profile_l2.png', link: '', needToken: false },
    // { title: "Badges", subtitle: "You’ve got 2 badges", icon: 'profile_l3.png', link: '', needToken: false },
    { title: "Purchase History", icon: 'profile_l4.png', link: '/purchase-history', needToken: true },
    // { title: "Viewed", icon: 'profile_l5.png', link: '#', needToken: true },
    { title: "Account Settings", subtitle: "Notifications, Language", icon: 'profile_l6.png', link: '/settings', needToken: true },
    { title: "Rate Us", icon: 'profile_l7.png', link: '#', needToken: false },
    { title: "Information", icon: 'profile_l8.png', link: '/information', needToken: false },
  ];

  useEffect(async () => {
    if (sessionStatus === 'authenticated') {
      api.user.get(session?.user.id, session?.user.accessToken).then(res => {
        setUserInfo(res.data.user);
      });
    }
  }, []);

  useEffect(async () => {
    if (sessionStatus === 'authenticated') {
      api.user.get(session?.user.id, session?.user.accessToken).then(res => {
        setUserInfo(res.data.user);
      });
    }
  }, [sessionStatus]);

  // if (sessionStatus === "unauthenticated") {
  //   router.push('/auth/login')
  //   return null;
  // }

  return (
    sessionStatus === 'loading'
      ? <Loader />
      : (
        <div className={styles.container}>
          <Head>
            <title>User Profile</title>
            <meta name="description" content="User profile" />
            <link rel="icon" href="/favicon.ico" />
          </Head>

          <main className={"ebook_reader_body home_pages_content"}>
            {sessionStatus === "authenticated" && <ProfileHeader userInfo={userInfo} />}

            <div className="profile_page">
              {sessionStatus === "authenticated" && <div className="profile_page_top_up">
                <div className="profile_page_top_up_left">
                  <a href="/top-up">Top Up</a>
                </div>
                <div className="profile_page_top_up_right">
                  <ul>
                    <li><a href="#">
                      <span className="pptur_img1"><img src="check.png" alt="images" /></span>
                      <span className="pptur_content">{userInfo?.remainingCoins}<img src="Arrow_right_20.png" alt="images" /></span>
                    </a></li>
                    <li><a href="#">
                      <span className="pptur_img1"><img src="check3.png" alt="images" /></span>
                      <span className="pptur_content">{userInfo?.remainingTickets}<img src="Arrow_right_20.png" alt="images" /></span>
                    </a></li>
                  </ul>
                </div>
              </div>}

              {sessionStatus !== "authenticated" && <div className='profile_page_login_section'>
                <button className='primary-btn' style={{ width: 150 }} onClick={() => setLoginModalVisible(true)}>Log In</button>
                <p className='mt-30 text-center'>Login or Create an Account to Purchase Coins, Earn Free Tickets, and utilize the full functionality of the Ricecakes application.</p>
              </div>}

              {/* <div className="profile_earn_tickets">
              <h2>Earn Tickets</h2>
            </div> */}

              {/* <Slider {...sliderSettings}>
              <div className="petc_single">
                <div className="petc_single_img">
                  <img src="profile_cimg.png" alt="images" />
                </div>
                <div className="petc_single_title">
                  <h2>Lucky Draw</h2>
                  <p>Come back daily for a chance to win!</p>
                </div>
                <div className="petc_bottom_content">
                  <p>Upcoming...</p>
                  <p>9:00 AM</p>
                </div>
              </div>
              <div className="petc_single">
                <div className="petc_single_img">
                  <img src="profile_cimg2.png" alt="images" />
                </div>
                <div className="petc_single_title petc_single_title2">
                  <h2>Video Ads</h2>
                  <p>Earn coins for every ad you watch!</p>
                </div>
                <div className="petc_bottom_content petc_bottom_content2">
                  <a href="#">Available Now</a>
                </div>
              </div>
              <div className="petc_single">
                <div className="petc_single_img">
                  <img src="profile_cimg.png" alt="images" />
                </div>
                <div className="petc_single_title">
                  <h2>Lucky Draw</h2>
                  <p>Come back daily for a chance to win!</p>
                </div>
                <div className="petc_bottom_content">
                  <p>Upcoming...</p>
                  <p>9:00 AM</p>
                </div>
              </div>
            </Slider> */}

              <div className="contents_page_chapter_menus profile_page_linking custom_padding mt-20">
                <ul>
                  {menus.map((menu, index) => {
                    if (menu.needToken && sessionStatus === "authenticated" || !menu.needToken) {
                      return <li key={index}>
                        <a href={menu.link}>
                          <span className="cpchapter_left">
                            <span className="cpcphapter_pimg"><img src={menu.icon} alt="profile-menu-icon" /></span>
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
                </ul>
              </div>
            </div>
            <Footer />
          </main>

          {sessionStatus === 'unauthenticated' && <LoginModal open={loginModalVisible} setOpen={setLoginModalVisible} />}
        </div>
      )
  )
}

export async function getServerSideProps({ req, res }) {
  const session = await getSession({ req });
  return {
    props: {}, // will be passed to the page component as props
  }
}
