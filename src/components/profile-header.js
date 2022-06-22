import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const ProfileHeader = ({ userInfo }) => {
  const [scroll, setScroll] = useState(false);
  useEffect(() => {
    window.addEventListener("scroll", () => {
      setScroll(window.scrollY > 0);
    });
  }, []);

  return (
    <div className={"home_heading_design profile_page_top_header " + (scroll ? 'headerfixed' : '')}>
      <div className="book_profile_header_right">
        <ul>
          <li><button onClick={() => signOut()}><img src="log_out.png" /></button></li>
        </ul>
      </div>
      <div className="profile_header">
        <div className="profile_header_left">
          <a href="#"><img src={userInfo?.avatar.url} alt="images" /></a>
        </div>
        <div className="profile_header_right">
          <a href="#">{userInfo?.name}</a>
          <a href="#">
            <span><img src="check2.png" alt="images" /></span>
            <span><img src="check2.png" alt="images" /></span>
          </a>
        </div>
        <div className="profiles_logout">
          <ul>
            <li><a href="#"><img src="log_out.png" /></a></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;