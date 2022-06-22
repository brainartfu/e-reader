import React, {
  createContext,
  useContext,
  useState
} from "react";

const CommentContext = createContext();

export const CommentProvider = ({ children }) => {
  const [parentId, setParentId] = useState(0);
  const [replyItemId, setReplyItemId] = useState(0);
  const [deletedItem, setDeletedItem] = useState({ id: 0, pid: 0 });

  const value = {
    replyItemId,
    setReplyItemId,
    parentId,
    setParentId,
    deletedItem,
    setDeletedItem
  }
  return <CommentContext.Provider value={value}>{children}</CommentContext.Provider>
}
export function useCommentContext() {
  return useContext(CommentContext);
}