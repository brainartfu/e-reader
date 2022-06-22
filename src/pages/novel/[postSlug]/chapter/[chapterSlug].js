import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { gql, useQuery } from '@apollo/client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { initializeApollo, addApolloState } from 'lib/apollo-client';
import { getSession, useSession } from "next-auth/react"

import { useRouter } from 'next/router'
import MangaChapterReadingFooter from 'components/wpmanga/manga-chapter-reading-footer';
import api from 'lib/api';
import Loader from 'components/common/loader';
import styles from '../../../../styles/Home.module.css'

const CHAPTER_QUERY = gql`
  query ChapterQuery ($slug: ID!, $chapterSlug: String!, $order: String!){
    wpmanga(id: $slug, idType: SLUG) {
      wpmangaId
      mangaChapter(chapter_slug: $chapterSlug)
      mangaSingleNextNav(order: $order, chapter_slug: $chapterSlug)
      mangaSinglePrevNav(order: $order, chapter_slug: $chapterSlug)
    }
    generalSettings {
      title
    }
  }
`;

export default function Chapter() {
  const { data: session, status: sessionStatus } = useSession();
  // const { wpmanga, site, chapter_data, chapter_content } = props;
  const router = useRouter();
  const { postSlug, chapterSlug, sort } = router.query;
  const [fontVisible, setFontVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [volumes, setVolumes] = useState([]);
  const [chapters, setChapters] = useState([]);

  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", e => {
      setScroll(window.scrollY > 0);
    });

    api.chapter.getChaptersByPost(postSlug, session?.user.accessToken).then(res => {
      setVolumes(res.data.wpmanga.mangaVolumeList);
      setChapters(res.data.wpmanga.mangaChaptersList);
    });
  }, []);

  const { loading, error, data: res, networkStatus } = useQuery(
    CHAPTER_QUERY,
    {
      variables: {
        slug: postSlug,
        chapterSlug: chapterSlug,
        order: sort !== "desc" ? "asc" : "desc"
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  if (error) return <div style={{ textAlign: 'center', marginTop: 200 }}>Error</div>
  if (loading) return <Loader />

  const site = res.generalSettings;
  const data = JSON.parse(res.wpmanga.mangaChapter);
  const wpmangaId = res.wpmanga.wpmangaId;
  const nextChapterSlug = JSON.parse(res.wpmanga.mangaSingleNextNav);
  const prevChapterSlug = JSON.parse(res.wpmanga.mangaSinglePrevNav);

  const handleTextContentClick = () => {
    setReportVisible(false);
    setListVisible(false);
    setFontVisible(false);
  }

  const handleClickRightTopIcon = () => {
    setListVisible(false);
    setFontVisible(false);
    setReportVisible(!reportVisible)
  }

  const handleSendTip = v => {
    if (window.confirm(`Are you sure want to send ${v} tips?`)) {
      api.tip.send(wpmangaId, chapterSlug, v, session?.user.accessToken).then(res => {
        if (res.data.sendTipChapter.status === 'success') {
          toast.success(res.data.sendTipChapter.message);
        } else {
          toast.error(res.data.sendTipChapter.message);
        }
      });
    }
  }


  return (
    <div className={styles.container}>
      <Head>
        <title>{data?.name}</title>
        <meta name="description" content={`Read more about ${data?.name} on ${site?.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Same as */}

      <main className={`ebook_reader_body home_pages_content`} >
        <div className={`home_heading_design chapter-header${scroll ? " chapter-header-fixed" : ""}`}>
          <div className='top-buttons'>
            <div className="chapter-header-left">
              <a href={`/novel/${postSlug}/chapters?sort=${router.query.sort}`}><img src="../../../close.png" /></a>
            </div>
            <div className="chapter-header-right">
              <button className='link-btn text-white' onClick={handleClickRightTopIcon}><i className="material-icons">more_vert</i></button>
            </div>
          </div>
          <div className="chapter-header-text">{data?.name}</div>
        </div>
        <div className={`text_page_main`}>
          <div className={`text-content`} onClick={handleTextContentClick} dangerouslySetInnerHTML={{ __html: data?.content }} />
          <div className="footer_text_page_header footer_text_page next-prev-link">
            <Link href={`/novel/${postSlug}/chapter/${prevChapterSlug}?sort=${sort !== "desc" ? "asc" : "desc"}`}>
              <a className={!prevChapterSlug ? 'disabled' : ''}><img src="../../../Arrow_left_20.png" /></a>
            </Link>
            <Link href={`/novel/${postSlug}/chapter/${nextChapterSlug}?sort=${sort !== "desc" ? "asc" : "desc"}`}>
              <a className={!nextChapterSlug ? 'disabled' : ''}><img src="../../../Arrow_right_20.png" /></a>
            </Link>
          </div>
          <div className={`footer_text_page_content`}>
            <h2>Send Tip</h2>
            <ul className='send-tip-section mt-20'>
              <li><div onClick={() => handleSendTip(2)}><span>2</span><img className='size-20 ml-5' src="../../../check.png" alt="images" /></div></li>
              <li><div onClick={() => handleSendTip(5)}><span>5</span><img className='size-20 ml-5' src="../../../check.png" alt="images" /></div></li>
              <li><div onClick={() => handleSendTip(10)}><span>10</span><img className='size-20 ml-5' src="../../../check.png" alt="images" /></div></li>
              <li>
                <div>
                  <input
                    onKeyUp={e => { if (e.key === "Enter") handleSendTip(e.target.value) }}
                    type="number"
                    className="custom-tip"
                    placeholder="Custom"
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
        <MangaChapterReadingFooter
          postSlug={postSlug}
          chapterSlug={chapterSlug}
          nextChapterSlug={nextChapterSlug}
          prevChapterSlug={prevChapterSlug}
          sort={sort !== "desc" ? "asc" : "desc"}
          reportVisible={reportVisible}
          setReportVisible={setReportVisible}
          fontVisible={fontVisible}
          setFontVisible={setFontVisible}
          listVisible={listVisible}
          setListVisible={setListVisible}
          chapters={chapters}
          volumes={volumes}
        />
      </main>
    </div>
  )
}

export async function getServerSideProps(context) {
  const session = await getSession({ req: context.req })

  const { postSlug, chapterSlug } = context.params;
  const apolloClient = initializeApollo(null, session?.user.accessToken, true);

  await apolloClient.query({
    query: CHAPTER_QUERY,
    variables: {
      slug: postSlug,
      chapterSlug: chapterSlug,
      order: !context?.query.sort ? "asc" : context.query.sort
    }
  });

  return addApolloState(apolloClient, {
    props: {},
  });
}