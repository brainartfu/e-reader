import React, { useEffect, useState } from "react";
import { useCommentContext } from "context/comment-context";
import { useInView } from 'react-intersection-observer';
import { initializeApollo } from 'lib/apollo-client';
import { useSession } from "next-auth/react";
import { gql } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import api from "lib/api";

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

const CommentItemFooter = ({ comment, parent, editable, totalCnt, setTotalCnt }) => {
  const { data: session, status: sessionStatus } = useSession();

  const { parentId, setParentId, replyItemId, setReplyItemId, setDeletedItem } = useCommentContext();

  const [liked, setLiked] = useState({
    currentUserLike: comment.currentUserLike,
    totalLikes: comment.totalLikes
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
        id: comment.id
      },
    });
    setLiked(liked.comment);
  }

  const setLikedStatus = () => {
    const apolloClient = initializeApollo(null, session?.user.accessToken, true);
    return apolloClient.mutate({
      mutation: SET_LIKED_MUTATION,
      variables: { commentId: comment.commentId, uuid: uuid }
    });
  }

  const handleSetLiked = () => {
    if (editable) {
      setLikedStatus().then(res => {
        getLikedStatus();
      });
    }
  }

  const handleReply = () => {
    if (comment.commentId === replyItemId) {
      setReplyItemId(0);
      setParentId(0);
    } else {
      setReplyItemId(comment.commentId);
      if (parent) {
        setParentId(parent.commentId);
      } else {
        setParentId(comment.commentId);
      }
    }
  }

  const handleDelete = () => {
    api.comment.delete(comment.id, session?.user.accessToken).then(res => {
      if (res.data.deleteComment) {
        setDeletedItem({
          id: res.data.deleteComment.comment.id,
          pid: res.data.deleteComment.comment.parentDatabaseId
        });
        setTotalCnt(totalCnt - 1);
      }
    });
  }

  return (
    <div className="comment-footer mt-10" ref={ref}>
      <p>{new Date(comment.date).toLocaleDateString()}</p>
      {editable && <p onClick={handleReply}>{comment.commentId === replyItemId ? 'Cancel' : 'Reply'}</p>}
      <div className="like-wrapper">
        <img onClick={handleSetLiked} className={liked.currentUserLike ? 'active' : ''} src={`./../../../../love_icon${liked.currentUserLike ? '' : '_outline'}.png`} alt="like" />
        <p>{liked.totalLikes}</p>
        {editable && <img onClick={handleDelete} className="size-10 ml-10" src={`./../../../../close.png`} alt="close" />}
      </div>
    </div>
  );
}

export default CommentItemFooter;