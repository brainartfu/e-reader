import React, { useState, useEffect } from "react";
import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';

import { initializeApollo } from 'lib/apollo-client';

import { useSession } from "next-auth/react";
import styles from '../../../styles/Home.module.css';
import { useRouter } from 'next/router';
import MangaDetailHeader from 'components/wpmanga/manga-detail-header';

import { v4 as uuidv4 } from 'uuid';
import Fallback from "components/Fallback";
import { getPostSlugPaths } from "lib/post-slug";
import LoginModal from "components/LoginModal";

const BALANCE_QUERY = gql`
  query ChapterQuery ($userId: ID!, $slug: ID!){
    user(id: $userId) {
      remainingCoins
      remainingTickets
    }
    wpmanga(id: $slug, idType: SLUG) {
      mangaChaptersList {
        id
        scope
      }
    }
  }
`;

const USE_BALANCE_MUTATION = gql`
  mutation UseBalance($mangaId: ID!, $chapterId: ID!, $pointsType: String!, $uuid: String!) {
    mangaBuyChapter(
      input: {
        manga_id: $mangaId,
        chapter_id: $chapterId,
        points_type: $pointsType,
        clientMutationId: $uuid
      }
    ) {
      status
      message
    }
  }
`;

const uuid = uuidv4();

const Chapters = ({ data, site }) => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const postSlug = router.query.postSlug;
  const [lockedChapter, setLockedChapter] = useState(null);
  const [scroll, setScroll] = useState(false);
  const [volumes, setVolumes] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [sort, setSort] = useState('asc');
  const [balance, setBalance] = useState();
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const handleClickLockedChapter = chapter => {
    setLockedChapter(chapter)
  }

  const handleUseCoinOrTicket = (type) => {
    useBalance(data.mangaId, lockedChapter.id, type).then(res => {
      if (res.data.mangaBuyChapter.status === 'success') {
        router.push(`/novel/${postSlug}/chapter/${lockedChapter.slug}`);
      } else {

      }
    });
  }

  const useBalance = (mangaId, chapterId, pointsType) => {
    const apolloClient = initializeApollo(null, session?.user.accessToken, true);
    return apolloClient.mutate({
      mutation: USE_BALANCE_MUTATION,
      variables: { mangaId, chapterId, pointsType, uuid }
    });
  }

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 30);
    });
  }, []);

  useEffect(() => {
    if (router.query.sort) {
      setSort(router.query.sort);
    }
  }, [router.query.sort])

  useEffect(() => {
    // router.push(`${router.asPath.split('?')[0]}?sort=${sort}`, null, { shallow: true });
    if (sort === 'desc') {
      setVolumes(data?.volumes.slice().reverse());
      setChapters(data?.chapters.slice().reverse());
    } else {
      setVolumes(data?.volumes);
      setChapters(data?.chapters);
    }
  }, [sort]);

  useEffect(async () => {
    if (sessionStatus === "authenticated") {
      const apolloClient = initializeApollo(null, session?.user.accessToken, true);

      const { data: balance } = await apolloClient.query({
        query: BALANCE_QUERY,
        variables: {
          userId: session?.user.id,
          slug: router.query.postSlug
        },

      });
      setBalance(balance);
      const newChapters = chapters.map(chapter => {
        const newChapter = balance.wpmanga.mangaChaptersList.find(c => c.id === chapter.id)
        if (newChapter) return { ...chapter, ...newChapter }
        return chapter;
      });
      setChapters(newChapters)
    }
  }, [sessionStatus]);

  return (
    <div className={styles.container}>
      <Head>
        <title>{site?.title}</title>
        <meta name="description" content={`Read more about ${site?.title} on ${site?.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"ebook_reader_body chapters_pages_content"} >
        <MangaDetailHeader className={scroll ? "chapters-header-fixed" : ""}>
          <div className="book_profile_header_left">
            <button className="header-back-btn" onClick={() => router.push(`/novel/${postSlug}`)}><img className="size-20" src="../../Arrow_left_20.png" /></button>
          </div>
          <div className="title">Contents</div>
          <div className="book_profile_header_right">
            <img src="../../data.png" className={`reverse-btn${sort === 'asc' ? ' reverse' : ''}`} onClick={() => setSort(sort === 'asc' ? 'desc' : 'asc')} />
          </div>
        </MangaDetailHeader>

        <div className="contents_page">
          <div className="contents_page_header">
            <h1>Contents</h1>
          </div>

          <div>
            {volumes?.length > 0 && volumes.map((volume, index) => (
              <React.Fragment key={index}>
                <h3 className="volume-name">{volume.name}</h3>
                <ul className="contents_page_chapter_menus">
                  {chapters.filter(c => c.volume_id === volume.id).map((chapter, index) => (
                    <li key={index}>
                      {(chapter.scope === 'free' || chapter.scope === 'app' || chapter.scope === 'unlock') &&
                        <Link href={{ pathname: `/novel/[slug]/chapter/[chapterslug]`, query: { slug: postSlug, chapterslug: chapter.slug, sort: sort } }}>
                          <a>
                            <span className="cpchapter_left">
                              <span className="cpcphapter_number">{index + 1}</span>
                              <span className="cpchapter_content">{chapter.title}</span>
                            </span>
                            <span className="cpchapter_right"><img src={`../../${chapter.scope === 'free' || chapter.scope === 'app' ? 'Arrow_right_20' : 'unlocked'}.png`} alt="images" /></span>
                          </a>
                        </Link>
                      }
                      {chapter.scope === 'premium' &&
                        <div className="chapter-item" onClick={() => handleClickLockedChapter(chapter)}>
                          <span className="cpchapter_left">
                            <span className="cpcphapter_number">{index + 1}</span>
                            <span className="cpchapter_content">{chapter.title}</span>
                          </span>
                          <span className="cpchapter_right"><img src={`../../locked.png`} alt="images" /></span>
                        </div>
                      }
                    </li>
                  ))}
                </ul>
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className={`locked-chapter-modal${lockedChapter ? ' active' : ''}`}>
          <div className="backdrop" onClick={() => setLockedChapter(null)}></div>
          <div className="content">
            <div className="top-handle"></div>
            <div className="content-block">
              <div>
                <h2>Locked Chapter</h2>
                <p>Unlock to read and support the author of this book</p>
              </div>
              <div className="image-wrapper">
                <img src="../../locked.png" alt="" style={{ width: 30 }} />
              </div>
            </div>
            <div className="cost-and-balance">
              <div>
                <p>Unlock cost</p>
                <div className="mini-wrapper">
                  <span>-{lockedChapter?.coin}</span>
                  <i></i>
                </div>
              </div>
              <div className="line"></div>
              <div>
                <p>Your balance</p>
                <div className="mini-wrapper">
                  <span>{balance?.user.remainingCoins}</span>
                  <i></i>
                </div>
              </div>
            </div>

            {sessionStatus !== "authenticated"
              ? <button className="get-more-coins-btn" onClick={() => setLoginModalVisible(true)}>Login to unlock</button>
              : (balance?.user.remainingCoins < lockedChapter?.coin
                ? <button className="get-more-coins-btn" onClick={() => router.push('/top-up')}>Get More Coins</button>
                : <button className="get-more-coins-btn" onClick={() => handleUseCoinOrTicket('coin')}>Use</button>)
            }

            {lockedChapter?.purchasable && sessionStatus === "authenticated" &&
              <>
                <p style={{ textAlign: 'center' }}>Or</p>
                <div className="use-ticket-div">
                  <i></i>
                  <div style={{ width: 200 }}>
                    <h3>Use Ticket</h3>
                    <p>Cost {lockedChapter?.ticket} Usable {balance?.user.remainingTickets}</p>
                  </div>
                  <button className="use-btn" disabled={balance?.user.remainingTickets < lockedChapter?.ticket} onClick={() => handleUseCoinOrTicket('ticket')}>Use</button>
                </div>
              </>
            }
          </div>
        </div>
      </main>

      {sessionStatus === 'unauthenticated' && <LoginModal open={loginModalVisible} setOpen={setLoginModalVisible} />}
    </div>
  )
}

export default Fallback(Chapters);

export async function getStaticProps({ params = {} } = {}) {
  const { postSlug } = params;
  const apolloClient = initializeApollo();
  const { data } = await apolloClient.query({
    query: gql`
      query ChaptersQuery ($slug: ID!) {
        wpmanga(id: $slug, idType: SLUG) {
          mangaChaptersList {
            coin
            id
            purchasable
            scope
            slug
            ticket
            title
            volume_id
          }
          mangaVolumeList {
            id
            index
            name
            date_gmt
          }
          databaseId
        } 
        generalSettings {
          title
        }
      }
    `,
    variables: {
      slug: postSlug
    }
  });

  const volumes = [];
  if (data.wpmanga.mangaChaptersList.find(c => c.volume_id === 0)) {
    volumes[0] = { id: 0, name: 'No Volume' };
  }

  return {
    props: {
      data: {
        mangaId: data.wpmanga.databaseId,
        volumes: data.wpmanga?.mangaVolumeList === null ? volumes : [...volumes, ...data.wpmanga?.mangaVolumeList],
        chapters: data.wpmanga.mangaChaptersList,
      },
      site: data.generalSettings,
    },
    revalidate: 10
  }
}


export async function getStaticPaths() {
  return await getPostSlugPaths();
}