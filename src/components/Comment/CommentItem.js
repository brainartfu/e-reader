import React, { useState } from "react";
import CommentItemFooter from "./CommentItemFooter";
import CommentReply from "./CommentReply";

const CommentItem = ({ comment, replies, editable, totalCnt, setTotalCnt }) => {
  const [showedAll, setShowedAll] = useState(false);

  return (
    <div className="comment-item">
      <img className="avatar mr-10" src={comment.author.node?.avatar.url} alt="avatar" />
      <div className="comment-content">
        <div className="title">{comment.author.node?.name}</div>
        <div dangerouslySetInnerHTML={{ __html: comment.content }}></div>

        <CommentItemFooter comment={comment} editable={editable} totalCnt={totalCnt} setTotalCnt={setTotalCnt} />

        {Array.isArray(replies) && replies.map((reply, index) => {
          if (showedAll) {
            return <CommentReply reply={reply} comment={comment} key={index} />
          } else {
            if (index < 2) {
              return <CommentReply reply={reply} comment={comment} key={index} />
            }
          }
        })}
        {Array.isArray(replies) && replies.length > 2 && !showedAll &&
          <div className="show-all-reply" onClick={() => setShowedAll(true)}>
            <img src="/arrow-down.png" alt="arrow-down" />
            <span className="ml-10">Show all replies</span>
          </div>
        }
      </div>
    </div>
  );
}

export default CommentItem;