import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from 'next/router'
import { checkLoggedIn } from "utils/common";

const Footer = () => {
  const router = useRouter();
  const menus = [
    { label: "Home", url: "/", icon: "home" },
    { label: "Explore", url: "/explore", icon: "explore" },
    { label: "Library", url: "/library", icon: "project" },
    { label: "Profile", url: "/profile", icon: "account" },
  ];

  return (
    <div className={"footer_main_area"}>
      <div className={"footer_home_bar"}>
        <ul>
          {menus.map((menu, index) => (
            <li key={index} className={menu.url === router.asPath.split('?')[0] ? 'active' : ''}>
              <Link href={menu.url}>
                <a>
                  <img src={`${menu.icon}${menu.url === router.asPath.split('?')[0] ? '-active' : ''}.png`} />
                  <span>{menu.label}</span>
                </a>
                {/* <a className={`menu_items${menu.url === router.asPath ? " active" : ""}`}>
                  <i className={"material-icons"}>{menu.icon}</i> <span>{menu.label}</span>
                </a> */}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Footer;