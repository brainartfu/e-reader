import { useState, useEffect } from "react";
import Head from 'next/head'
import Link from 'next/link'
import { gql, useQuery } from '@apollo/client';

import { initializeApollo } from 'lib/apollo-client';
import { useSession } from 'next-auth/react';

import styles from '../styles/Home.module.css'

import LibraryHeader from '../components/library-header';
import Footer from '../components/footer';
import { getLocalBookmark } from "utils/common";
import LoginModal from "components/LoginModal";
import api from "lib/api";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TimedRewards from "components/common/timed-rewards";

const READING_QUERY = gql`
  query ReadingQuery ($id: ID!) {
    user(id: $id) {
      readingHistory
    }
  }
`;
const READING_COUNTS_QUERY = gql`
  query ReadingQuery ($ids: [ID]!) {
    wpmangas(where: {in: $ids}) {
      nodes {
        databaseId
        mangaChapterCount
        currentReadingChapterCount
      }
    }
  }
`;
const BOOKMARK_QUERY = gql`
  query BookmarkQuery ($id: ID!) {
    user(id: $id) {
      currentBookmarks {
        page
        book {
          title
          slug
          featuredImage {
            node {
              sourceUrl
            }
          }
          wpmangaId
          currentReadingChapterCount
          mangaChapterCount
        }
      }
      email
      username
      userId
    }
  }
`;

export default function Library() {
  const { data: session, status: sessionStatus } = useSession();
  const [readings, setReadings] = useState([]);
  const [counts, setCounts] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deletion, setDeletion] = useState({ id: 0, cate: "" });
  const [timedRewardsVisible, setTimedRewardsVisible] = useState(false);
  const [rewards, setRewards] = useState([]);

  const handleShowMenu = (e, postId, cate) => {
    setDeletion({ id: postId, cate: cate });
    setMenuVisible(true);
    e.stopPropagation();
  }

  const handleDelete = () => {
    if (deletion.cate === 'reading') {
      api.reading.remove(deletion.id, session?.user.accessToken).then(res => {
        setReadings(readings.filter(v => v.id !== deletion.id));
        if (res.data.removeMadaraUserHistory.status === 'success') {
          toast.success(res.data.removeMadaraUserHistory.message);
        }
      })
    } else if (deletion.cate === 'bookmark') {
      api.bookmark.remove(deletion.id, session?.user.accessToken).then(res => {
        setBookmarks(bookmarks.filter(v => v.wpmangaId !== deletion.id));
        if (res.data.deleteBookmark.status === 'success') {
          toast.success("Removed successfully.");
        }
      });
    }
  }

  useEffect(async () => {
    if (session?.user.id && sessionStatus === "authenticated") {
      const apolloClient = initializeApollo(null, session?.user.accessToken, true);

      const { data: data1 } = await apolloClient.query({
        query: READING_QUERY,
        variables: {
          id: session?.user.id
        }
      });
      let reads = JSON.parse(data1.user.readingHistory);
      setReadings(reads);

      const { data: data3 } = await apolloClient.query({
        query: READING_COUNTS_QUERY,
        variables: {
          ids: reads.map(v => v.id)
        }
      });
      setCounts(data3.wpmangas.nodes);

      const { data: data2 } = await apolloClient.query({
        query: BOOKMARK_QUERY,
        variables: {
          id: session?.user.id
        }
      });
      setBookmarks(data2.user.currentBookmarks.map(v => v.book));

      api.rewards.get().then(res => {
        setRewards(JSON.parse(res.data.timeBasedRewards));
      });
    } else {
      setLoginModalVisible(true)
      // setBookmarks(Object.values(getLocalBookmark()));
    }
  }, [sessionStatus]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Library</title>
        <meta name="description" content={"library"} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"ebook_reader_body home_pages_content"} onClick={() => setMenuVisible(false)}>
        <LibraryHeader setTimedRewardsVisible={setTimedRewardsVisible} />
        <div id="tab1" className="tab-content active">
          <div className="reading_tab_items">
            {readings && readings.length > 0 && readings.map((post, index) => {
              return (
                <div className={"reading_tab"} key={index}>
                  <div className="reading_tab_img">
                    <img src={post.featuredImage?.node.sourceUrl.length > 0 ? post.featuredImage?.node.sourceUrl : "small_cover.png"} />
                  </div>
                  <div className="reading_tab_content">
                    <ul>
                      <li><a href="#"><i></i>{counts?.find(v => v.databaseId === post.id)?.currentReadingChapterCount}/{post.chapter_count}</a></li>
                      <li>
                        <button className="link-btn" onClick={e => handleShowMenu(e, post.id, 'reading')}>
                          <img style={{ width: 10 }} src="Dots_menu.png" alt="" />
                        </button>
                      </li>
                    </ul>
                    <Link href={post.chapter ? `/novel/${post.slug}/chapter/${post.chapter.chapter_slug}` : `/novel/${post.slug}`}>
                      <a>
                        <h4>{post.title}</h4>
                      </a>
                    </Link>
                  </div>
                </div>
              )
            })}
            {readings?.length === 0 && <p className="text-center width-full mt-40">No data</p>}
          </div>
        </div>
        <div id="tab2" className="tab-content">
          <div className="bookmarks_tab_items">
            {bookmarks && bookmarks.length > 0 && bookmarks.map((post, index) => {
              return (
                <div key={post?.slug} className={"bookmarks_tab" + (index == bookmarks.length - 1 ? ' custom_padding' : '')}>
                  <div className="bookmarks_tab_img">
                    <img src={post?.featuredImage?.node.sourceUrl.length > 0 ? post?.featuredImage?.node.sourceUrl : "book_cover.png"} />
                  </div>
                  <div className="bookmarks_tab_content">
                    <ul>
                      <li><a href="#"><i></i>{post?.currentReadingChapterCount}/{post?.mangaChapterCount}</a></li>
                      <li>
                        <button className="link-btn" onClick={e => handleShowMenu(e, post.wpmangaId, 'bookmark')}>
                          <img style={{ width: 15 }} src="Dots_menu.png" alt="" />
                        </button>
                      </li>
                    </ul>
                    <Link href={'/novel/' + post.slug}>
                      <a>
                        <h4>{post.title}</h4>
                      </a>
                    </Link>
                  </div>
                </div>
              )
            })}
            {bookmarks?.length === 0 && <p className="text-center width-full mt-40">No data</p>}
          </div>
        </div>
        <Footer />

        <div className={`library-delete-menu${menuVisible ? ' active' : ''}`}>
          <ul>
            <li onClick={() => handleDelete()}><img className="size-20 mr-10" src="../../delete.png" />Delete</li>
            <li onClick={() => setMenuVisible(false)}><img className="size-15 mr-10" style={{ marginLeft: 3 }} src="../../close.png" />Cancel</li>
          </ul>
        </div>

        <TimedRewards rewards={rewards} open={timedRewardsVisible} setOpen={setTimedRewardsVisible} />
        {sessionStatus === 'unauthenticated' && <LoginModal open={loginModalVisible} setOpen={setLoginModalVisible} />}
      </main>
    </div>
  )
}