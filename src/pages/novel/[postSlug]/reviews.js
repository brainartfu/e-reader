import React from "react";
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { initializeApollo } from 'lib/apollo-client';
import MangaDetailHeader from 'components/wpmanga/manga-detail-header';
import StarRating from "components/common/star-rating";
import Fallback from "components/Fallback";
import Reviews from "components/Reviews";
import styles from '../../../styles/Home.module.css';
import { getPostSlugPaths } from "lib/post-slug";
import { useSession } from "next-auth/react";

const ReviewList = props => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { reviewItems, featureReviews, rating, reviews, reviewCount } = props;

  const newList = [
    {
      type: 'rating',
      reviewItems,
      featureReviews,
      reviewCount,
      rating
    },
    ...reviews
  ];

  return (
    <div className={styles.container}>
      <Head>
        {/* <title>{post?.title}</title>
        <meta name="description" content={`Read more about ${post?.title} on ${site?.title}`} />
        <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <main className={"ebook_reader_body home_pages_content"} >
        {/* <MangaDetailHeader className={scroll ? "chapters-header-fixed" : ""}> */}
        <MangaDetailHeader>
          <div className="book_profile_header_left">
            <button className="header-back-btn" onClick={() => router.push(`/novel/${router.query.postSlug}`)}><img src="../../Arrow_left_20.png" /></button>
          </div>
          <div className="title">Contents</div>
          {!reviews.find(v => v.author.node?.id === session?.user.id) &&
            <a href={`/novel/${router.query.postSlug}/reviews/new`} style={{ background: "#484848", borderRadius: 20, color: 'black', padding: '4px 10px', fontSize: 12, fontWeight: 'bold' }}>Add</a>
          }
        </MangaDetailHeader>

        {/* <div className="ratings">
          <div className="rating-item">
            <h2 style={{ fontSize: 24 }}>Overall Rating</h2>
            <StarRating rating={rating} size="large" />
          </div>
          {
            Object.keys(reviewItems).map((k, i) => (
              <div className="rating-item" key={k}>
                <p>{reviewItems[k].wp_review_item_title}</p>
                <StarRating rating={featureReviews ? (featureReviews[k]?.count === 0 ? 0 : featureReviews[k]?.total / featureReviews[k]?.count) : 0} />
              </div>
            ))
          }
        </div> */}
        <Reviews reviews={newList} />
      </main>
    </div>
  )
}

export default Fallback(ReviewList);

export async function getStaticProps(context) {
  const postSlug = context.params.postSlug;
  const apolloClient = initializeApollo();
  const { data } = await apolloClient.query({
    query: gql`
      query ChapterQuery ($slug: ID!){
        wpmanga(id: $slug, idType: SLUG) {
          databaseId
          reviewItems
          rating
          featureReviews
          reviewCount
          # readingHistory
        }
      }
    `,
    variables: {
      slug: postSlug,
    }
  });

  const reviewItems = JSON.parse(data.wpmanga.reviewItems);
  const reviewCount = data.wpmanga.reviewCount;
  const featureReviews = JSON.parse(data.wpmanga.featureReviews);

  let reviews = [];
  let after = '';
  let nextPage = false;
  do {
    const { data: reviewResult } = await apolloClient.query({
      query: gql`
        query ReviewsQuery ($contentId: ID, $first: Int, $after: String){
          comments(where: {contentId: $contentId, commentType: "wp_review_comment"}, first: $first, after: $after) {
            nodes {
              author {
                node {
                  id
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
        first: 100,
        after,
        contentId: data.wpmanga.databaseId
      }
    });
    after = reviewResult.comments.pageInfo.endCursor;
    nextPage = reviewResult.comments.pageInfo.hasNextPage;
    reviews = reviews.concat(reviewResult.comments.nodes);
  } while (nextPage)

  return {
    props: {
      reviewItems,
      reviewCount,
      featureReviews,
      rating: data.wpmanga.rating,
      reviews
    },
    revalidate: 10, // In seconds
  }
}

export async function getStaticPaths() {
  return await getPostSlugPaths();
}