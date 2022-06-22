import React, { useState, useEffect, useRef } from "react";
import { RecyclerListView, DataProvider } from "recyclerlistview/web";
import Review from "components/Review";
import StarRating from "components/common/star-rating";
import useRecyclerlist from "hooks/useRecyclerlist";

const RATINGS_QUERY = '';

export default function Reviews({ reviews }) {
  const { listRef, layoutProvider, scrollWidth, scrollHeight } = useRecyclerlist();
  const [reviewRows, setReviewRows] = useState(reviews);
  const [sort, setSort] = useState('newest');

  let dataProvider = new DataProvider((r1, r2) => {
    return r1 !== r2;
  });
  dataProvider = dataProvider.cloneWithRows(reviewRows);

  const sortReviews = () => {
    if (sort === 'liked') {
      setReviewRows(reviews.sort((a, b) => b.totalLikes - a.totalLikes));
    } else if (sort === 'newest') {
      setReviewRows(reviews.sort((a, b) => b.date?.localeCompare(a.date)));
    }
  }

  useEffect(() => {
    sortReviews();
  }, [sort]);

  const _renderReview = (review, index) => {
    if (review.type === 'rating') {
      const { reviewItems, featureReviews, rating } = review;

      return (
        <div className="ratings" key={index}>
          <div className="rating-item">
            <h2 style={{ fontSize: 24 }}>Overall Rating</h2>
            <StarRating rating={rating} size="large" />
          </div>
          {Object.keys(reviewItems).map((k, i) => (
            <div className="rating-item" key={k}>
              <p>{reviewItems[k].wp_review_item_title}</p>
              <StarRating rating={featureReviews ? (featureReviews[k]?.count === 0 ? 0 : featureReviews[k]?.total / featureReviews[k]?.count) : 0} />
            </div>
          ))}
          <div className="sub-header">
            <h2>{review.reviewCount === 0 ? "No reviews" : `${review.reviewCount} ${review.reviewCount === 1 ? "Review" : "Reviews"}`}</h2>
            <div className="sort">
              <div className={sort === 'liked' ? 'active' : ''} onClick={() => setSort('liked')}>Liked</div>
              <div className={sort === 'newest' ? 'active' : ''} onClick={() => setSort('newest')}>Newest</div>
            </div>
          </div>
        </div>
      )
    } else {
      return <Review review={review} key={index}/>
    }
  }
  return (
    <div className="review-list" ref={listRef}>
      {reviews.map((review, index) => _renderReview(review, index))}

      {/* <RecyclerListView
        style={{
          width: '100%',
          height: '100vh',
        }}
        // useWindowScroll={false}
        dataProvider={dataProvider}
        layoutProvider={layoutProvider}
        extendedState={{ sort }}
        rowRenderer={_renderReview}
        forceNonDeterministicRendering={true}
        canChangeSize={true}
      /> */}
    </div>
  )
}
