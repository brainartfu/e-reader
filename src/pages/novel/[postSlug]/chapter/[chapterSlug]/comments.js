import React, { useState, useEffect } from "react";
import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';

import { initializeApollo } from 'lib/apollo-client';

import styles from '../../../../../styles/Home.module.css'
import { useRouter } from 'next/router'
import MangaDetailHeader from 'components/wpmanga/manga-detail-header';

import { useSession } from "next-auth/react";
import Fallback from "components/Fallback";
import { getPostChapterSlugPaths } from "lib/post-chapter-slug";
import CommentItem from "components/Comment/CommentItem";
import { useCommentContext } from "context/comment-context";
import api from "lib/api";
import LoginModal from "components/LoginModal";

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CommentList = (props) => {
  const { data: session, status: sessionStatus } = useSession();
  const { parentId, deletedItem } = useCommentContext();
  const { wpcomments, commentCount, postId } = props;
  const [totalCnt, setTotalCnt] = useState(commentCount);
  const [comments, setComments] = useState(wpcomments);
  const [commentText, setCommentText] = useState('');
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const router = useRouter();
  const { postSlug, chapterSlug } = router.query;
  const [sort, setSort] = useState('hottest');

  const sortComments = () => {
    if (sort === 'hottest') {
      setComments([...comments.sort((a, b) => b.totalLikes - a.totalLikes)]);
    } else if (sort === 'newest') {
      setComments([...comments.sort((a, b) => b.date.localeCompare(a.date))]);
    }
  }

  const handleCreateComment = () => {
    if (sessionStatus === 'authenticated') {
      api.chapterComment.create(postId, chapterSlug, commentText, parentId * 1, session?.user.accessToken).then(res => {
        let newComment = JSON.parse(res.data.createChapterComment.comment);
        api.comment.get(newComment.commentId, postSlug, chapterSlug).then(response => {
          setTotalCnt(response.data.wpmanga.commentsCount);
          const newComment = response.data.comments.nodes[0];

          if (newComment.parentDatabaseId === 0) {
            setComments([newComment, ...comments]);
          } else {
            let temp = [];
            for (let c = 0; c < comments.length; c++) {
              temp[c] = comments[c];
              if (comments[c].commentId === newComment.parentDatabaseId) {
                temp[c].replies.nodes = [newComment, ...comments[c].replies.nodes];
              }
            };
            setComments(temp)
          }
        });

        setCommentText('');

        if (res.data.createChapterComment.status === 'success') {
          toast.success(res.data.createChapterComment.message);
        } else {
          toast.error(res.data.createChapterComment.message);
        }
      }).catch(err => {
        toast.error(err.message)
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
            <button className="header-back-btn" onClick={() => router.back()}><img src="../../../../Arrow_left_20.png" /></button>
          </div>
        </MangaDetailHeader>

        <div className="sub-header">
          <h2>{totalCnt === 0 ? "No comments" : `${totalCnt} ${totalCnt === 1 ? "Comment" : "Comments"}`}</h2>
          <div className="sort">
            <div className={sort === 'hottest' ? 'active' : ''} onClick={() => setSort('hottest')}>Hottest</div>
            <div className={sort === 'newest' ? 'active' : ''} onClick={() => setSort('newest')}>Newest</div>
          </div>
        </div>

        <div className="comment-items">
          {comments.length > 0 && comments.map((comment, index) =>
            <CommentItem key={index} comment={comment} replies={comment.replies?.nodes} editable={true} totalCnt={totalCnt} setTotalCnt={setTotalCnt} />
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
  const { postSlug, chapterSlug } = context.params;

  const apolloClient = initializeApollo();
  const { data } = await apolloClient.query({
    query: gql`
      query ChapterQuery ($postSlug: ID!, $chapterSlug: String!){
        wpmanga(id: $postSlug, idType: SLUG) {
          databaseId
          commentsCount(chapter_slug: $chapterSlug)
          chapterComments(chapter_slug: $chapterSlug) {
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
        }
      }
    `,
    variables: {
      postSlug,
      chapterSlug,
    }
  });

  return {
    props: {
      postId: data?.wpmanga?.databaseId || 0,
      commentCount: data?.wpmanga?.commentsCount || 0,
      wpcomments: data?.wpmanga?.chapterComments || []
    },
    revalidate: 10, // In seconds
  }
}

export async function getStaticPaths(context) {
  return await getPostChapterSlugPaths();
}