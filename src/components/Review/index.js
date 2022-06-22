import React, { useEffect, useState } from "react";
import { useInView } from 'react-intersection-observer';
import StarRating from 'components/common/star-rating';
import { gql } from '@apollo/client';
import { initializeApollo } from 'lib/apollo-client';
import { useSession } from "next-auth/react";
import { v4 as uuidv4 } from 'uuid';
const uuid = uuidv4();

const GET_LIKED_QUERY = gql`
  query GetLiked ($id: ID!){
    comment(id: $id) {
      currentUserLike
      totalLikes
    }
  }
`;

const SET_LIKED_MUTATION = gql`
  mutation SetLiked($commentId: ID!, $uuid: String!) {
    createLike(
      input: {
        commentId: $commentId,
        clientMutationId: $uuid
      }
    ) {
      status
      message
    }
  }
`;

const Review = ({ review }) => {
  const { data: session, status: sessionStatus } = useSession();
  const [liked, setLiked] = useState({
    currentUserLike: false,
    totalLikes: review.totalLikes
  });

  const { ref, inView } = useInView({
    threshold: 0,
  });
  useEffect(() => {
    if (inView && sessionStatus !== "loading") {
      getLikedStatus();
    }
  }, [inView, sessionStatus]);

  const getLikedStatus = async () => {
    const apolloClient = initializeApollo(null, session?.user.accessToken, true);
    const { data: liked } = await apolloClient.query({
      query: GET_LIKED_QUERY,
      variables: {
        id: review.id
      },
    });
    setLiked(liked.comment);
  }
  const setLikedStatus = () => {
    const apolloClient = initializeApollo(null, session?.user.accessToken, true);
    return apolloClient.mutate({
      mutation: SET_LIKED_MUTATION,
      variables: { commentId: review.commentId, uuid: uuid }
    });
  }

  const handleSetLiked = () => {
    setLikedStatus().then(res => {
      getLikedStatus();
    });
  }

  return (
    <>
      {/* <div ref={ref}>
        <div className="avatar" style={{ width: 20, height: 20 }}>
          <img src={review.author.node.avatar.url} />
        </div>
        <div dangerouslySetInnerHTML={{ __html: review.content }} />
        <div className="likes">{review.totalLikes}</div>
        <div className="username">{review.author.node.username}</div>
      </div> */}

      <div className="review-item" ref={ref}>
        <div className="review-title">
          <div className="avatar">
            <img src={review.author.node?.avatar.url} alt="avatar" />
          </div>
          <div className="title">{review.author.node?.name}</div>
          <div className="func"><i className="fas fa-ellipsis-v"></i></div>
        </div>
        <div className="rating">
          <StarRating rating={review.reviewRating} />
          <div className="ml-10">{new Date(review.date).toLocaleDateString()}</div>
        </div>
        <div />
        <div className="review-content" dangerouslySetInnerHTML={{ __html: review.content }} />
        <div className="like-wrapper">
          <button className="like-btn mt-10" onClick={handleSetLiked}>
            <img className={liked.currentUserLike ? 'active' : ''} src={`./../../../../love_icon${liked.currentUserLike ? '' : '_outline'}.png`} alt="like" />
          </button>
          <p>{liked.totalLikes}</p>
        </div>
      </div>
    </>
  );
}

export default Review;