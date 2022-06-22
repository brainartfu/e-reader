import React from "react";
import CommentItemFooter from "./CommentItemFooter";

const CommentReply = ({ reply, comment }) => {

  return (
    <div className="sub-comment">
      <img className="avatar mr-5" src={reply.author.node.avatar.url} alt="avatar" />
      <div className="comment-content">
        <div className="title">{reply.author.node.name}</div>
        <div dangerouslySetInnerHTML={{ __html: reply.content }} ></div>

        <CommentItemFooter comment={reply} parent={comment} editable={true} />
      </div>
    </div>
  );
}

export default CommentReply;