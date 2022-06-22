import React, { useState, useEffect } from "react";
import Head from 'next/head'
import Link from 'next/link'
import { gql, useQuery } from '@apollo/client';

import { initializeApollo, addApolloState } from 'lib/apollo-client';

import styles from '../../../styles/Home.module.css'
import { useRouter } from 'next/router'
import MangaDetailHeader from 'components/wpmanga/manga-detail-header';
import MangaChaptersFooter from 'components/wpmanga/manga-chapters-footer';

import { useSession } from "next-auth/react";
import StarRating from "components/common/star-rating";
import Fallback from "components/Fallback";
import { getPostSlugPaths } from "lib/post-slug";
import CommentItem from "components/Comment/CommentItem";
import { v4 as uuidv4 } from 'uuid';
import { useCommentContext } from "context/comment-context";
import LoginModal from "components/LoginModal";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const uuid = uuidv4();

const ADD_COMMENT_MUTATION = gql`
  mutation CreateComment($postId: Int!, $content: String!, $parent: ID!, $uuid: String!) {
    createComment(
      input: {
        commentOn: $postId
        content: $content
        parent: $parent
        clientMutationId: $uuid
      }
    ) {
      comment {
        id
        date
        content
        totalLikes
        currentUserLike
        commentId
        parentDatabaseId
        replies {
          nodes {
            id
            date
            content
            totalLikes
            currentUserLike
            commentId
            parentDatabaseId
            author {
              node {
                avatar {
                  url
                }
                name
              }
            }
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
      }
      success
    }
  }
`;

const CommentList = (props) => {
  const { data: session, status: sessionStatus } = useSession();
  const { parentId, deletedItem } = useCommentContext();
  const { wpcomments, commentCount, postId } = props;
  const [comments, setComments] = useState(wpcomments);
  const [commentText, setCommentText] = useState('');
  const router = useRouter();
  const [sort, setSort] = useState('hottest');
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const sortComments = () => {
    if (sort === 'hottest') {
      setComments([...comments.sort((a, b) => b.totalLikes - a.totalLikes)]);
    } else if (sort === 'newest') {
      setComments([...comments.sort((a, b) => b.date.localeCompare(a.date))]);
    }
  }

  const createComment = () => {
    const apolloClient = initializeApollo(null, session?.user.accessToken, true);
    return apolloClient.mutate({
      mutation: ADD_COMMENT_MUTATION,
      variables: { postId: postId, content: commentText, parent: parentId, uuid: uuid }
    });
  }

  const handleCreateComment = () => {
    if (sessionStatus === 'authenticated') {
      createComment().then(res => {
        if (res.data.createComment.success) {
          if (res.data.createComment.comment.parentDatabaseId === 0) {
            setComments([res.data.createComment.comment, ...comments]);
          } else {
            let temp = [];
            for (let c = 0; c < comments.length; c++) {
              temp[c] = comments[c];
              if (comments[c].commentId === res.data.createComment.comment.parentDatabaseId) {
                temp[c].replies.nodes = [res.data.createComment.comment, ...comments[c].replies.nodes];
              }
            };
            setComments(temp)
          }
          setCommentText('');

          if (res.data.createComment.success) {
            toast.success("Created successfully.");
          }
        }
      });
    } else {
      setLoginModalVisible(true);
    }
  }

  useEffect(() => {
    sortComments();
  }, [sort]);

  useEffect(() => {
    if (deletedItem.id !== 0) {
      if (deletedItem.pid === 0) {
        setComments(comments.filter(v => v.id !== deletedItem.id));
      } else {
        let temp = comments;
        for (let c = 0; c < comments.length; c++) {
          if (comments[c].commentId === deletedItem.pid) {
            temp[c].replies.nodes = comments[c].replies.nodes.filter(v => v.id !== deletedItem.id);
          }
        }
        setComments([...temp]);
      }
    }
  }, [deletedItem]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Comments</title>
        <meta name="description" content={`Comments`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"ebook_reader_body comment_pages_content"} >
        <MangaDetailHeader>
          <div className="book_profile_header_left">
            <button className="header-back-btn" onClick={() => router.push(`/novel/${router.query.postSlug}`)}>
              <img src="../../Arrow_left_20.png" />
            </button>
          </div>
          <div className="title">Contents</div>
        </MangaDetailHeader>

        <div className="sub-header">
          <h2>{commentCount === 0 ? "No comments" : `${commentCount} ${commentCount === 1 ? "Comment" : "Comments"}`}</h2>
          <div className="sort">
            <div className={sort === 'hottest' ? 'active' : ''} onClick={() => setSort('hottest')}>Hottest</div>
            <div className={sort === 'newest' ? 'active' : ''} onClick={() => setSort('newest')}>Newest</div>
          </div>
        </div>

        <div className="comment-items">
          {comments.length > 0 && comments.map((comment, index) =>
            <CommentItem key={index} comment={comment} replies={comment.replies.nodes} editable={true} />
          )}
        </div>

        <div className="comment-footer-row">
          {/* <img src="../../../../emoji.png" alt="send" /> */}
          <textarea value={commentText} onChange={e => setCommentText(e.target.value)} className="ml-10 mr-10" placeholder="Comment" rows={1}></textarea>
          <img className="mr-10" src="../../../../send.png" alt="send" onClick={handleCreateComment} />
        </div>
      </main>

      {sessionStatus === 'unauthenticated' && <LoginModal open={loginModalVisible} setOpen={setLoginModalVisible} />}
    </div>
  )
}

export default Fallback(CommentList);

export async function getStaticProps(context) {
  const postSlug = context.params.postSlug;
  const apolloClient = initializeApollo();
  const { data } = await apolloClient.query({
    query: gql`
      query ChapterQuery ($slug: ID!){
        wpmanga(id: $slug, idType: SLUG) {
          databaseId
          commentsCount
        }
      }
    `,
    variables: {
      slug: postSlug,
    }
  });

  let comments = [];
  let after = '';
  let nextPage = false;
  do {
    const { data: result } = await apolloClient.query({
      query: gql`
        query ReviewsQuery ($contentId: ID, $first: Int, $after: String){
          comments(where: {commentType: "comment", contentId: $contentId, parent: 0}, first: $first, after: $after) {
            nodes {
              id
              date
              content
              totalLikes
              currentUserLike
              commentId
              parentDatabaseId
              replies {
                nodes {
                  id
                  date
                  content
                  totalLikes
                  currentUserLike
                  commentId
                  parentDatabaseId
                  author {
                    node {
                      avatar {
                        url
                      }
                      name
                    }
                  }
                }
              }
              author {
                node {
                  name
                  avatar {
                    url
                  }
                }
              }
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
    after = result.comments.pageInfo.endCursor;
    nextPage = result.comments.pageInfo.hasNextPage;
    comments = comments.concat(result.comments.nodes);
  } while (nextPage)

  return {
    props: {
      postId: data?.wpmanga.databaseId,
      commentCount: data?.wpmanga.commentsCount,
      wpcomments: comments
    },
    revalidate: 10, // In seconds
  }
}

export async function getStaticPaths() {
  return await getPostSlugPaths();
}