import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';

import { initializeApollo } from 'lib/apollo-client';

import styles from '../styles/Home.module.css'

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import HomeHeader from '../components/home-header';
import Footer from '../components/footer';
import UserReview from 'components/common/user-review';
import GenreSorter from 'components/common/genre-sorter';
import { useSession } from 'next-auth/react';
import api from 'lib/api';
import { getLocalBookmark } from 'utils/common';
import LoginModal from 'components/LoginModal';
import TimedRewards from 'components/common/timed-rewards';

export default function Home({ page, posts, frontBanner, mangagenres, rewards }) {
  const { data: session, status: sessionStatus } = useSession();
  const { title, description } = page;
  const [book, setBook] = useState();
  const [authors, setAuthors] = useState();
  const [adults, setAdults] = useState([]);
  const [selected, setSelected] = useState();
  const [keyword, setKeyword] = useState("");
  const [bookmarkStatus, setBookmarkStatus] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [timedRewardsVisible, setTimedRewardsVisible] = useState(false);

  const handleBookmark = () => {
    if (sessionStatus === 'authenticated') {
      if (bookmarkStatus) {
        api.bookmark.remove(book.databaseId, session?.user.accessToken).then(res => {
          setBookmarkStatus(false);
        });
      } else {
        api.bookmark.set(book.databaseId, session?.user.accessToken).then(res => {
          setBookmarkStatus(true);
        });
      }
    } else {
      setLoginModalVisible(true);
      // setLocalBookmark(book.databaseId, { ...book, status: !bookmarkStatus });
      // setBookmarkStatus(!bookmarkStatus);
    }
  }

  const handleSearch = keyword => {
    setKeyword(keyword);
  }

  useEffect(async () => {
    if (session?.user.id && sessionStatus === 'authenticated' && book) {
      api.bookmark.isBookmarked(book?.id, session?.user.accessToken).then(res => {
        setBookmarkStatus(res.data.wpmanga.isBookmark);
      });
    } else {
      setBookmarkStatus(getLocalBookmark(book?.databaseId)?.status);
    }
  }, [sessionStatus, book]);

  useEffect(() => {
    let temp = [], num = 5, ind = 0;
    for (let i = 0; i <= mangagenres[1].wpmangas.nodes.length / num; i++) {
      temp[i] = [];
      for (let j = 0; j < num; j++) {
        if (!mangagenres[1].wpmangas.nodes[ind]) break;
        temp[i][j] = mangagenres[1].wpmangas.nodes[ind];
        ind++;
      }
    }
    setAdults(temp);
  }, [mangagenres[1]]);

  useEffect(() => {
    if (posts) {
      setBook(posts[0]);
    }
  }, [posts]);

  useEffect(() => {
    if (book) {
      setAuthors(JSON.parse(book?.mangaAuthors).map(v => v.name).join(', '));
    }
  }, [book]);

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"ebook_reader_body home_pages_content"}>
        <HomeHeader onSearch={handleSearch} keyword={keyword} setTimedRewardsVisible={setTimedRewardsVisible} />
        <div className="page-header-inner tt-wrap">
          <div className="ph-image">
            <div className="ph-image-inner">
              <img src={frontBanner} alt="Image" />
            </div>
          </div>
        </div>

        <div className={"home_card_details_area mt-10"}>
          <Slider infinite={posts.length > 2} arrows={false} slidesToShow={3} slidesToScroll={2} focusOnSelect={true}>
            {posts && posts.length > 0 && posts.map(post =>
              <div key={post.slug} data-hash={post.slug} className={"single_card_main_area"} onClick={() => setBook(post)}>
                <img className="singleCategPostImage" src={post.featuredImage?.node.sourceUrl.length ? post.featuredImage?.node.sourceUrl : "book_cover.png"} />
              </div>
            )}
          </Slider>
          {!posts || posts.length === 0 && <p>Oops, no posts found!</p>}
        </div>

        <div>
          <h2 className='book-title mt-10'>
            <Link href={'/novel/' + book?.slug}>
              <a>{book?.title}</a>
            </Link>
            <button className='bookmark-btn' onClick={handleBookmark}><img src={`../bookmarks${bookmarkStatus ? '-active' : ''}.png`} /></button>
          </h2>
          <p style={{ fontSize: 11 }}>Author: {authors}</p>
          <p style={{ paddingBottom: 10 }} dangerouslySetInnerHTML={{ __html: book?.content }}></p>
          {/* <UserReview rating={book?.rating} viewed={book?.viewCount} files={book?.mangaChapterCount} /> */}
          <div className={"home-genres explore_menu mt-20"}>
            <ul>
              {mangagenres.map((genre, index) => <li key={index}><button>{genre.name}</button></li>)}
            </ul>
          </div>
        </div>

        <hr className='mt-20' />

        {mangagenres && mangagenres.length > 0 && mangagenres.map((genre, index) => {
          return index != 1 ? (
            <div key={genre.slug} className={"home_category_main_area pb-3 " + (index == mangagenres.length - 1 ? 'custom_padding' : '')}>
              <div className={"category_title_area"}>
                <h2>{genre.name}</h2>
                <Link href={{ pathname: "/explore", query: { genre: genre.slug } }}><a>See All <i className={"fal fa-chevron-right"}></i></a></Link>
              </div>

              <Slider infinite={genre.wpmangas.nodes.length > 2} arrows={false} slidesToShow={3} slidesToScroll={2}>
                {genre.wpmangas.nodes.map(post => {
                  return (
                    <div key={post.slug} className={"single_categ_items"}>
                      <img className="singleCategPostImage" src={(post.featuredImage?.node.sourceUrl.length > 0 ? post.featuredImage?.node.sourceUrl : "small_cover.png")} />
                      <span>{genre.name}</span>
                      <h4 className="manga-single-title">
                        <Link href={'/novel/' + post.slug}>
                          <a>{post?.title}</a>
                        </Link>
                      </h4>
                      {/* <UserReview rating={post.rating} viewed={post.viewCount} /> */}
                    </div>
                  )
                })}
              </Slider>
            </div>
          ) :
            <React.Fragment key={index}></React.Fragment>
          {/* (
            <div key={genre.slug} className={"another_category_main_area pb-3" + (index == mangagenres.length - 1 ? 'custom_padding' : '')}>
              <div className={"category_title_area"}>
                <h2>{genre.name}</h2>
                <Link href={{ pathname: "/explore", query: { genre: genre.slug } }}><a>See All <i className={"fal fa-chevron-right"}></i></a></Link>
              </div>

              <Slider infinite={adults.length > 1} arrows={false} slidesToShow={adults.length > 1 ? 1.3 : 1} slidesToScroll={2}>
                {adults.length > 0 && adults.map((adult, ind) => (
                  <div className={"another_book_over_items"} key={ind}>
                    {adult.map((post, i) => (
                      <div key={post.slug} className="single_another_home_cover">
                        <div className="left_another_cover">
                          <img className="" src={post.featuredImage?.node.sourceUrl.length > 0 ? post.featuredImage?.node.sourceUrl : "small_cover.png"} />
                        </div>
                        <div className="right_another_cover">
                          <div className="number_count_txt">
                            <span>{ind * 5 + i + 1}</span>
                          </div>
                          <div className="another_home_cover_title">
                            <h4 className="manga-single-title">
                              <Link href={'/novel/' + post.slug}>
                                <a href={'/novel/' + post.slug}>{post?.title}</a>
                              </Link>
                            </h4>
                            <span>{genre.name}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </Slider>
            </div>
          ) */}
        })}

        {keyword.length > 0 && <div className='searched'>
          {posts.filter(p => p.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1).map((post, index) =>
            <div key={post.slug} className={"single_explore_items"}>
              <div className={"single_explore_card"}>
                <img className="single_explore_image" src={post.featuredImage?.node.sourceUrl.length > 0 ? post.featuredImage?.node.sourceUrl : "small_cover.png"} />
              </div>
              <div className={"single_explore_content"}>
                <span>{post.wpmangagenres.nodes.map(v => v.name).join(', ')}</span>
                <h4 className="manga-single-title">
                  <Link href={'/novel/' + post.slug}><a>{post?.title}</a></Link>
                </h4>
                <p>Author: {JSON.parse(post.mangaAuthors).map(v => v.name).join(', ')}</p>
                {/* <UserReview rating={post.rating} viewed={post.viewCount} files={post.mangaChapterCount} /> */}
              </div>
            </div>
          )}
          {posts.filter(p => p.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1).length === 0 && <p className='text-center mt-30'>No searched data.</p>}
        </div>}

        <Footer />

        <TimedRewards rewards={rewards} open={timedRewardsVisible} setOpen={setTimedRewardsVisible} />

        {sessionStatus === 'unauthenticated' && <LoginModal open={loginModalVisible} setOpen={setLoginModalVisible} />}
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  const data = await apolloClient.query({
    query: gql`
      {
        generalSettings {
          title
          description
        }
        frontBanner
        wpmangas(where: {status: PUBLISH}, first:10 ) {
          edges {
            node {
              id
              title
              slug
              rating
              content
              viewCount
              mangaAuthors
              mangaChapterCount
              databaseId
              featuredImage {
                node {
                  id
                  sourceUrl
                }
              }
              wpmangagenres {
                nodes {
                  name
                  slug
                }
                
              }
            }
          }
        } 
        wpmangagenres{
          edges {
            node {
              count
              name
              link
              slug
              uri
              wpmangas(where: {status: PUBLISH, orderby: {field: MODIFIED, order: DESC}}, first:15) {
                nodes {
                  id
                  slug
                  title
                  rating
                  viewCount
                  mangaChapterCount
                  featuredImage {
                    node {
                      id
                      sourceUrl
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
  });

  const posts = data?.data.wpmangas.edges.map(({ node }) => node).map(post => {
    return {
      ...post,
      path: `/novel/${post.slug}`
    }
  });

  const mangagenres = data?.data.wpmangagenres.edges.map(({ node }) => node).map(genre => {

    return {
      ...genre,
      path: '/category/${genre.slug}'
    }
  });
  const page = {
    ...data?.data.generalSettings
  }

  const rewards = await api.rewards.get();

  return {
    props: {
      page,
      frontBanner: data?.data.frontBanner,
      posts,
      mangagenres,
      rewards: JSON.parse(rewards?.data.timeBasedRewards)
    },
    revalidate: 10
  }
}
