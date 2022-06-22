import { useRef, useEffect, useState } from 'react';
import { DataProvider, LayoutProvider } from "recyclerlistview/web";

function useRecyclerlist() {
  const listRef = useRef();
  const [scrollWidth, setScrollWidth] = useState(400);
  const [scrollHeight, setScrollHeight] = useState(800);
  const [layoutProvider, setLayoutProvider] = useState(new LayoutProvider(
    index => 1,
    (type, dim) => {
      const bodyClientWidth = document.querySelector('body').clientWidth;
      dim.width = bodyClientWidth;
      dim.height = 500;
    },
  ));

  const handleResize = () => {
    if (listRef.current) {
      setScrollWidth(listRef.current.clientWidth);
      setScrollHeight(listRef.current.clientHeight);
    }
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    }
  }, []);

  useEffect(() => {
    if (listRef.current) {
      setScrollWidth(listRef.current.clientWidth);
      setScrollHeight(listRef.current.clientHeight);
    }
  }, [listRef]);

  useEffect(() => {
    setTimeout(() => {
      setLayoutProvider(new LayoutProvider(
        index => 1,
        (type, dim) => {
          const bodyClientWidth = document.querySelector('body').clientWidth;
          dim.width = bodyClientWidth;
          dim.height = 400;
        },
      ), 1000);
    });
  }, [scrollWidth, scrollHeight]);

  return {
    listRef,
    layoutProvider,
    scrollWidth,
    scrollHeight
  };
}
export default useRecyclerlist;