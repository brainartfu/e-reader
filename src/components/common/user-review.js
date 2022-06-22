import { useEffect, useState } from "react";

import StarIcon from 'assets/img/star_small.png';
import EyeIcon from 'assets/img/eye_view.png';
import FileIcon from 'assets/img/file.png';

const UserReview = ({ rating, viewed, files }) => {

  return (
    <ul className={"explore_single_star"}>
      <li><a href="#"><img src={StarIcon.src} alt="" /> <span>{rating}</span></a></li>
      <li><a href="#"><img src={EyeIcon.src} alt="" /> <span>{viewed}</span></a></li>
      {(files || files === 0) && <li><a href="#"><img src={FileIcon.src} alt="" /> <span>{files} {files > 1 ? 'Chs' : 'Ch'}</span></a></li>}
    </ul>
  );
};

export default UserReview;