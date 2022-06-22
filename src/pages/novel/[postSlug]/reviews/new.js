import React, { useState, useEffect } from "react";
import Head from 'next/head'
import { gql } from '@apollo/client';

import { initializeApollo, addApolloState } from 'lib/apollo-client';
import { useSession } from "next-auth/react";

import styles from 'styles/Home.module.css'
import { useRouter } from 'next/router'
import MangaDetailHeader from 'components/wpmanga/manga-detail-header';
import { v4 as uuidv4 } from 'uuid';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const uuid = uuidv4();

import StarRating from "components/common/star-rating";

const ADD_REVIEW_MUTATION = gql`
  mutation CreateReview($postId: ID!, $content: String!, $rating: String!, $uuid: String!) {
    createReview(
      input: {
        clientMutationId: $uuid
        commentFeatureRating: $rating
        commentOn: $postId
        content: $content
        parent: 0
      }
    ) {
      status
      message
    }
  }
`;

export default function Reviews({ reviewItems, postId }) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [reviewText, setReviewText] = useState('');
  const [ratings, setRatings] = useState({});

  const handleChangeRating = (ratingKey, ratingValue) => {
    setRatings({ ...ratings, [ratingKey]: ratingValue });
  }
  const createReview = () => {
    const apolloClient = initializeApollo(null, session?.user.accessToken, true);
    return apolloClient.mutate({
      mutation: ADD_REVIEW_MUTATION,
      variables: { postId: postId, content: reviewText, rating: JSON.stringify(ratings), uuid: uuid }
    });
  }

  const handleCreateReview = () => {
    if (reviewText.length >= 140) {
      createReview().then(res => {
        if (res.data.createReview.status === 'success') {
          router.push(`/novel/${router.query.postSlug}/reviews`);
          toast.success(res.data.createReview.message);
        } else {
          toast.error(res.data.createReview.message);
        }
      });
    }
  }

  useEffect(() => {
    if (reviewItems) {
      let rates = {};
      Object.keys(reviewItems).map(k => {
        return rates[k] = 0;
      });
      setRatings(rates);
    }
  }, [reviewItems]);

  return (
    <div className={styles.container}>
      <Head>
        <title>New review</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"new_review_pages_content"} >
        <div className="header">
          <div className="book_profile_header_left">
            <button className="header-back-btn" onClick={() => router.back()}><img src="../../../Arrow_left_20.png" /></button>
          </div>
          <div className="title">Write a review</div>
          <button className="post-btn" onClick={handleCreateReview}>POST</button>
        </div>

        <div className="ratings">
          {Object.keys(reviewItems).map((k, i) =>
            <div className="rating-item" key={i}>
              <p>{reviewItems[k].wp_review_item_title}</p>
              <StarRating key={i} editable={true} onChange={v => handleChangeRating(reviewItems[k].id, v)} />
            </div>
          )}
          <hr style={{ borderTop: '1px solid #424242' }} />
          <div className="rating-item">
            <span>Overall</span>
            <span>0</span>
          </div>
        </div>
        <div className="review-txt">
          <textarea rows={10}
            placeholder="Review should be more than 140 characters."
            onChange={e => setReviewText(e.target.value)} value={reviewText} >
          </textarea>
          <p className="character-count">{reviewText.length}</p>
          {reviewText.length < 140 && <p className="character-count-error">The text should be more than 140 characters.</p>}
        </div>

      </main>
    </div>
  )
}


export async function getServerSideProps(context) {
  const postSlug = context.params.postSlug;
  const apolloClient = initializeApollo();
  const { data } = await apolloClient.query({
    query: gql`
      query ChapterQuery ($slug: ID!){
        wpmanga(id: $slug, idType: SLUG) {
          databaseId
          reviewItems
        }
      }
    `,
    variables: {
      slug: postSlug,
    }
  });
  const reviewItems = JSON.parse(data.wpmanga.reviewItems);
  const postId = data.wpmanga.databaseId;

  return addApolloState(apolloClient, {
    props: {
      postId,
      reviewItems
    },
  })
}
