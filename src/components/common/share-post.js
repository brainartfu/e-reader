import { useEffect, useState } from "react";

import FacebookIcon from 'assets/img/facebook.png';
import TwitterIcon from 'assets/img/twitter.png';
import AppleIcon from 'assets/img/apple.png';
import CopyIcon from 'assets/img/copy.png';

const SharePost = ({ open, setOpen }) => {

  return (
    <div className={`share-modal${open ? ' opened' : ''}`} onClick={() => setOpen(!open)}>
      <div className="content" onClick={e => e.stopPropagation()}>
        <div className="social-item"><img src={FacebookIcon.src} />Facebook</div>
        <div className="social-item"><img src={TwitterIcon.src} />Twitter</div>
        <div className="social-item"><img src={AppleIcon.src} />Apple</div>
        <div className="social-item"><img src={CopyIcon.src} />Copy book URL</div>
      </div>
    </div>
  );
};

export default SharePost;