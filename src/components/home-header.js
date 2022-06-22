import { useEffect, useState } from "react";
import SingleSearchForm from "./common/single-search-form";

const HomeHeader = ({ onSearch, keyword, setTimedRewardsVisible }) => {
  const [scroll, setScroll] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 0);
    });
  }, []);

  return (
    <div className={"home_heading_design " + (scroll ? 'headerfixed' : '')}>
      <div className="home-page-header">
        {keyword.length === 0 && <img className="size-25 home-logo mr-10" src="/logo-icon.png" alt="" />}
        {keyword.length > 0 && <img onClick={() => onSearch("")} className="ml-5 mr-5 size-20 home-logo mr-10" src="/Arrow_left_20.png" alt="" />}
        <SingleSearchForm placeholder="Search" onSearch={onSearch} keyword={keyword} />
        <a href="/announcements" className="link-btn ml-10"><img className="size-25" src="/crown.png" alt="" /></a>
        <button onClick={() => setTimedRewardsVisible(true)} className="link-btn ml-10"><img className="size-25" src="/gift.png" alt="" /></button>
      </div>
    </div>
  );
};

export default HomeHeader;