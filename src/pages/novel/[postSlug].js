import React, { useState, useEffect } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';
import { getLocalBookmark, setLocalBookmark } from 'utils/common';
import { initializeApollo } from 'lib/apollo-client';

import styles from '../../styles/Home.module.css'
import StarRating from "components/common/star-rating";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


import { useRouter } from 'next/router';
import MangaDetailHeader from 'components/wpmanga/manga-detail-header';
import MangaDetailFooter from 'components/wpmanga/manga-detail-footer';
import { useSession } from 'next-auth/react';
import Review from 'components/Review';
import UserReview from 'components/common/user-review';
import { getPostSlugPaths } from 'lib/post-slug';
import Fallback from 'components/Fallback';
import CommentItem from 'components/Comment/CommentItem';
import api from 'lib/api';
import SharePost from 'components/common/share-post';
import LoginModal from 'components/LoginModal';

const Manga = ({ post, site, galleryImage, relatedData, reviewResult, commentResult }) => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const chaptersData = post?.mangaChaptersData === '' ? [] : JSON.parse(post?.mangaChaptersData);
  const volumes = chaptersData.volumes;

  const [shareOpen, setShareOpen] = useState(false);
  const [bookmarkStatus, setBookmarkStatus] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  var chapter_data = [];
  var currentReading = post?.mangaCurrentReading;
  var singleChapters = chaptersData.singleChapters;
  singleChapters?.map(chapter => {
    chapter_data.push(chapter);
  })
  if (!currentReading || currentReading == "" || currentReading == null || currentReading == undefined || currentReading == 0) {
    volumes?.map(volume => {
      var chapters = volume.volume_data;
      chapters.map(chapter => {
        chapter_data.push(chapter);
      })
    })
    currentReading = chapter_data[chapter_data.length - 1]; // last chapter
  } else {
    currentReading = JSON.parse(currentReading);
  }

  const handleBookmark = () => {
    if (sessionStatus === 'authenticated') {
      if (bookmarkStatus) {
        api.bookmark.remove(post.databaseId, session?.user.accessToken).then(res => {
          setBookmarkStatus(false);
        });
      } else {
        api.bookmark.set(post.databaseId, session?.user.accessToken).then(res => {
          setBookmarkStatus(true);
        });
      }
    } else {
      setLoginModalVisible(true);
      // setLocalBookmark(post.databaseId, { ...post, status: !bookmarkStatus });
      // setBookmarkStatus(!bookmarkStatus);
    }
  }

  useEffect(async () => {
    if (session?.user.id && sessionStatus === 'authenticated') {
      api.bookmark.isBookmarked(post.id, session?.user.accessToken).then(res => {
        setBookmarkStatus(res.data.wpmanga.isBookmark);
      });
    } else {
      setBookmarkStatus(getLocalBookmark(post.databaseId)?.status);
    }
  }, [sessionStatus]);

  return (
    <div className={styles.container}>
      <Head>
        <title>{post?.title}</title>
        <meta name="description" content={`Read more about ${post?.title} on ${site?.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"ebook_reader_body home_pages_content"} >
        <div className={"home_heading_design book_profile_header mb-20"}>
          <div className="book_profile_header_left">
            <button className='header-back-btn' onClick={() => router.push('/explore')}><img src="../Arrow_left_20.png" /></button>
          </div>
          <div className="book_profile_header_right">
            <button className="link-btn" onClick={() => setShareOpen(!shareOpen)}><img className='size-20' src="../upload.png" alt="images" /></button>
            <button className="link-btn" onClick={handleBookmark}><img className='size-20' src={`../bookmarks${bookmarkStatus ? '-active' : ''}.png`} /></button>
          </div>
        </div>

        <Slider slidesToShow={2} slidesToScroll={1} infinite={galleryImage.length > 2} arrows={false}>
          <div className="bptc_single">
            <img className="" src={post.featuredImage?.node.sourceUrl.length > 0 ? post.featuredImage?.node.sourceUrl : "../book_cover.png"} />
          </div>
          {galleryImage && galleryImage.length > 0 && (
            galleryImage.map(media =>
              <div key={media.id} className="bptc_single">
                {media.mediaType === 'image' && <img src={media.url} />}
                {media.mediaType === 'file' &&
                  <video autoPlay={true} muted={true} loop={true}>
                    <source src={media.url} type="video/mp4" />
                    <source src={media.url} type="video/ogg" />
                    Your browser does not support the video tag.
                  </video>
                }
              </div>
            )
          )}
        </Slider>

        <div className="book_profile_header_title">
          <h2>{post?.title}</h2>
          {post.mangaAuthors && post.mangaAuthors.length > 0 && (
            JSON.parse(post.mangaAuthors).map((author, index) => {
              const comma = index === JSON.parse(post.mangaAuthors).length - 1 ? '' : ', ';
              return <React.Fragment key={index}>
                <a key={author.id} href="#">
                  {author.name}
                </a>{comma}
              </React.Fragment>
            })
          )}
        </div>

        {/* <div className="book_profile_rating">
          <div className="book_profile_rating_left">
            <h1>{post.rating}</h1>
            <StarRating rating={post.rating} />
          </div>
          <div className="book_profile_rating_right">
            <div className="bprr_left">
              <h2>{post.mangaChaptersPerWeek}</h2>
              <p>Chs/Week</p>
            </div>
          </div>
        </div> */}

        <div className="book_profile_category">
          <ul>
            <li><a href="#"><img src="../bp_category.png" alt="images" />Daily Upload</a></li>
            {post.wpmangagenres?.nodes.map(genre => <li key={genre.slug}><a href="#">{genre.name}</a></li>)}
          </ul>
        </div>

        <div className="profile_category_content">
          {post.content != null && (
            <>
              <h2>Synopsis</h2>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            </>
          )}
        </div>

        <div className="book_profile_update_content">
          <a href={"/novel/" + post.slug + "/chapters"}>
            <span className="book_profile_update_content_left">
              <span className="bpucl_left">
                <img src="../book_cover.png" alt="images" />
              </span>
              <span className="bpucl_right">
                <p>Updated {post.mangaLatestUpdateTime}</p>
                <p>Contents</p>
                <p>
                  {post.mangaChapterCount} {post.mangaChapterCount > 1 ? 'Chapters' : 'Chapter'}
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  {post.mangaChaptersPerWeek} chapters / week
                </p>
              </span>
            </span>
            <span className="book_profile_update_content_right">
              <img src="../Arrow_right_20.png" alt="images" />
            </span>
          </a>
        </div>

        {/* <div className="book_profile_review">
          <div className="category_title_area book_profile_rev">
            <h2>Reviews</h2>
            {post.reviewCount === 0 && <Link href={`/novel/${post.slug}/reviews/new`}><a>Add <i className="fal fa-chevron-right"></i></a></Link>}
            {post.reviewCount > 0 && <Link href={`/novel/${post.slug}/reviews`}><a>See All {post.reviewCount} <i className="fal fa-chevron-right"></i></a></Link>}
          </div>
        </div>
        {reviewResult.map((review, index) => (
          <Review review={review} key={index} />
        ))} */}

        {/* <div className="book_profile_comment">
          <div className="category_title_area">
            <h2>Comments</h2>
            <Link href={`/novel/${post.slug}/comments`}><a>{`${post.commentsCount === 0 ? "Add" : `See All ${post.commentsCount}`}`} <i className="fal fa-chevron-right"></i></a></Link>
          </div>
        </div>
        <div className='comment-items'>
          {commentResult.map((comment, index) => (
            <CommentItem comment={comment} key={index} replies={[]} editable={false} />
          ))}
        </div> */}

        {/* <div className="home_category_main_area pb-3" style={{ paddingBottom: 0 }}>
          <div className="category_title_area">
            <h2>You May Also Like</h2>
            <a href="#">See All <i className="fal fa-chevron-right"></i></a>
          </div>
          <Slider infinite={relatedData?.wpmangas?.nodes.length > 2} arrows={false} slidesToShow={3} slidesToScroll={2}>
            {relatedData?.wpmangas?.nodes.map(related => {
              return (
                <div key={related.slug} className="single_categ_items">
                  <img className="relatedFeatured" src={related.featuredImage?.node.sourceUrl.length > 0 ? related.featuredImage?.node.sourceUrl : "../book_cover.png"} />
                  <span>
                    {related.wpmangagenres?.nodes.map((genre, index) => {
                      const comma = index > 1 ? '' : ', ';
                      return index < 3 && (
                        <small key={genre.slug}>{genre.name}{comma}</small>
                      );
                    })}
                  </span>
                  <h4 className={"manga-single-title"}>
                    <Link href={related.slug}><a href={related.slug}>{related.title}</a></Link>
                  </h4>
                  <UserReview rating={related.rating} viewed={related.viewCount} />
                </div>
              )
            })}
          </Slider>
        </div> */}
      </main>

      <SharePost open={shareOpen} setOpen={setShareOpen} />

      {sessionStatus === 'unauthenticated' && <LoginModal open={loginModalVisible} setOpen={setLoginModalVisible} />}
    </div>
  )
}

export default Fallback(Manga);

export async function getStaticProps({ params = {} } = {}) {
  const { postSlug } = params;

  const apolloClient = initializeApollo();

  const data = await apolloClient.query({
    query: gql`
      query PostBySlug($slug: String!) {
        generalSettings {
          title
        }
        wpmangaBy(slug: $slug) {
          id
          databaseId
          content(format: RENDERED)
          title
          slug
          rating
          viewCount
          mangaChapterCount
          mangaChaptersPerWeek
          mangaLatestUpdateTime
          imageGallery
          mangaAuthors
          reviewCount
          commentsCount
          mangaChaptersData(user_id: 1)
          author {
            node {
              firstName
              lastName
              slug
            }
          }
          featuredImage {
            node {
              id
              sourceUrl
            }
          }
          wpmangagenres {
            nodes {
              id
              termTaxonomyId
              name
              slug
            } 
          } 
        }
      }
    `,
    variables: {
      slug: postSlug
    }
  });

  const post = data?.data.wpmangaBy;

  const site = {
    ...data?.data.generalSettings
  }
  var gallery = '';
  if (post.imageGallery.length > 0) {
    try {
      gallery = JSON.parse(JSON.parse(post.imageGallery));
    } catch (e) {
      gallery = JSON.parse(post.imageGallery);

    }
  }
  var galleryImage = [];
  if (gallery) {
    for (let i = 0; i < gallery.length; i++) {
      const ID = parseInt(gallery[i]);
      if (ID != null) {
        const data = await apolloClient.query({
          query: gql`
            query PostByID($id: Int!) {
              mediaItemBy(mediaItemId: $id) {
                id
                mediaType
                mediaItemUrl
              }
            }`,
          variables: {
            id: ID
          }
        });
        var object = {
          id: data?.data.mediaItemBy.id,
          url: data?.data.mediaItemBy.mediaItemUrl,
          mediaType: data?.data.mediaItemBy.mediaType
        }
        galleryImage.push(object);
      }
    }
  }
  //Create instance for related data
  var taxonomyId = 0;
  if (post.wpmangagenres.nodes.length > 0) {
    const genre = post.wpmangagenres.nodes[Math.floor(Math.random() * post.wpmangagenres.nodes.length)];
    taxonomyId = parseInt(genre.termTaxonomyId);
  }
  var relatedData = '';
  if (taxonomyId > 0) {
    //Data to get related data
    const data = await apolloClient.query({
      query: gql`
        query RelatedData($taxonomyId:ID!, $postID:[ID!]) {
          wpmangagenre(id: $taxonomyId, idType: DATABASE_ID) {
            id
            name
            slug
            termTaxonomyId
            wpmangas(where: {notIn: $postID}, first: 5) {
              nodes{
                id
                databaseId
                content
                title
                slug
                rating
                viewCount
                imageGallery
                mangaAuthors
                author {
                  node {
                    firstName
                    lastName
                    slug
                  }
                }
                featuredImage {
                  node {
                    id
                    sourceUrl
                  }
                }
                wpmangagenres {
                  nodes {
                    id
                    termTaxonomyId
                    name
                    slug
                  } 
                }
              }
            }
          }
        }`
      ,
      variables: {
        taxonomyId: taxonomyId,
        postID: parseInt(post.databaseId)
      }
    });
    relatedData = data?.data.wpmangagenre;
  }


  const { data: reviewResult } = await apolloClient.query({
    query: gql`
      query ReviewsQuery ($contentId: ID, $first: Int, $after: String){
        comments(where: {contentId: $contentId, commentType: "wp_review_comment"}, first: $first, after: $after) {
          nodes {
            author {
              node {
                name
                isRestricted
                databaseId
                avatar {
                  default
                  extraAttr
                  forceDefault
                  foundAvatar
                  height
                  isRestricted
                  rating
                  scheme
                  size
                  url
                  width
                },
              }
            }
            id
            reviewRating
            date
            commentId
            content
            totalLikes
            type
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }
    `,
    variables: {
      first: 2,
      after: '',
      contentId: post.databaseId
    }
  });

  const { data: commentResult } = await apolloClient.query({
    query: gql`
      query ReviewsQuery ($contentId: ID, $first: Int, $after: String){
        comments(where: {contentId: $contentId, commentType: "comment"}, first: $first, after: $after) {
          nodes {
            author {
              node {
                name
                isRestricted
                databaseId
                avatar {
                  default
                  extraAttr
                  forceDefault
                  foundAvatar
                  height
                  isRestricted
                  rating
                  scheme
                  size
                  url
                  width
                },
              }
            }
            id
            parentDatabaseId
            date
            commentId
            content
            totalLikes
            type
          } 
        }
      }
    `,
    variables: {
      first: 2,
      after: '',
      contentId: post.databaseId
    }
  });


  return {
    props: {
      post,
      site,
      galleryImage,
      relatedData,
      reviewResult: reviewResult?.comments.nodes,
      commentResult: commentResult?.comments.nodes
    },
    revalidate: 10
  }
}

export async function getStaticPaths() {
  return await getPostSlugPaths();
}