import { useEffect, useState } from "react";

import star1 from 'assets/img/star1.png';
import star2 from 'assets/img/star2.png';
import star3 from 'assets/img/star3.png';
import starSmall1 from 'assets/img/star1-small.png';
import starSmall2 from 'assets/img/star2-small.png';
import starSmall3 from 'assets/img/star3-small.png';

const StarRating = ({ rating = 0, size, editable = false, onChange }) => {
  const ary = [1, 2, 3, 4, 5];
  const [rate, setRate] = useState(rating);

  const getSrc = (v) => {
    let imgs = size === 'large' ? [star1, star2, star3] : [starSmall1, starSmall2, starSmall3];
    let img = imgs[0];
    if (rate < v) img = rate * 1 + 0.5 < v * 1 ? imgs[2] : imgs[1];
    return img.src;
  }

  const handleChange = v => {
    if (onChange) {
      onChange(v);
      setRate(v)
    }
  }

  return (
    <ul className="star-rating">
      {ary.map(v => (
        <li key={v}>
          <button>
            <img className={`star-rating-img${size === 'large' ? ' large' : ''}`} src={getSrc(v)} alt="star" onClick={() => handleChange(v)} />
          </button>
        </li>)
      )}
    </ul>
  );
};

export default StarRating;