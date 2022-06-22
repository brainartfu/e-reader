import React, { useState, useEffect } from "react";
import MyCheckBox from 'components/common/my-checkbox';
import Link from 'next/link'
import { useRouter } from "next/router";

const MangaChapterReadingFooter = ({
  postSlug, chapterSlug, nextChapterSlug, prevChapterSlug, sort, volumes,
  chapters, reportVisible, setReportVisible, fontVisible,
  setFontVisible, listVisible, setListVisible }) => {

  const router = useRouter();

  const fonts = [
    { id: 'inter', name: 'Inter', font: 'Inter' },
    { id: 'merri', name: 'Merriweather', font: 'Merriweather' },
    { id: 'roboto', name: 'Roboto', font: 'Roboto' },
    { id: 'opensans', name: 'Open Sans', font: 'OpenSans' },
    { id: 'ubuntu', name: 'Ubuntu', font: 'Ubuntu' },
  ];

  const [theme, setTheme] = useState('black');
  const [align, setAlign] = useState('left');
  const [paragraph, setParagraph] = useState(3);
  const [fontSize, setFontSize] = useState(3);
  const [fontFamily, setFontFamily] = useState(fonts[0]);

  const changeTheme = (e, themeName, color) => {
    if (document.body.className.split('-')[0] === themeName) return;
    setTheme(themeName);
    document.querySelectorAll(".ripple").forEach(el => el.remove());
    document.body.classList.remove('black-mode', 'yellow-mode', 'white-mode');

    // let tempTheme = themeName === "black" ? 'white' : 'black';
    // document.body.classList.add(`${tempTheme}-mode`);

    // setTimeout(() => {
    document.body.classList.remove('black-mode', 'yellow-mode', 'white-mode');
    document.body.classList.add(`${themeName}-mode`);
    // }, 3000);

    let span = document.createElement('span');
    span.classList.add('ripple');
    span.style.backgroundColor = color;
    span.style.top = (e.pageY - 500) + 'px';
    span.style.left = (e.pageX - 500) + 'px';
    span.style.width = '1000px';
    span.style.height = '1000px';
    span.style.zIndex = 999;
    span.style.pointerEvents = 'none';
    document.body.appendChild(span);
    span.classList.add('rippleEffect');
  }

  const handleChapterOpen = chapter => {
    if (chapter.scope === 'free' || chapter.scope === 'app' || chapter.scope === 'unlock') {
      router.push(`/novel/${postSlug}/chapter/${chapter.slug}`);
      setListVisible(false);
    }
  }

  useEffect(() => {
    document.querySelectorAll(".text-content")[0].style.fontFamily = fontFamily.font;
  }, [fontFamily]);

  useEffect(() => {
    document.querySelectorAll(".text-content")[0].style.lineHeight = 18 + paragraph * 2 + 'px';
  }, [paragraph]);

  useEffect(() => {
    document.querySelectorAll(".text-content")[0].style.fontSize = 12 + fontSize * 2 + 'px';
  }, [fontSize]);

  useEffect(() => {
    document.querySelectorAll(".text-content")[0].style.textAlign = align;
  }, [align]);

  useEffect(() => {
    localStorage.setItem('textStyles', JSON.stringify({ theme, align, fontFamily, paragraph, fontSize }));
  }, [theme, align, fontFamily, paragraph, fontSize]);

  // useEffect(() => {
  //   const styles = JSON.parse(localStorage.getItem('textStyles'));
  //   if (styles) {
  //     setTheme(styles.theme);
  //     setAlign(styles.align);
  //     setFontFamily(styles.fontFamily);
  //     setFontSize(styles.fontSize);
  //     setParagraph(styles.paragraph);
  //   }
  // }, []);

  return (
    <div className="footer_main_area manga_chapter_footer">
      <div className={`report-section${reportVisible ? ' active' : ''}`}>
        {/* <div className="report-menu-item">
          <img className="size-20 mr-10" src="../../../unlocked.png" />
          Turn on Auto Unlock
        </div> */}
        <div className="report-menu-item" onClick={() => router.push(`/novel/${postSlug}/chapter/${chapterSlug}/report`)}>
          <img className="size-20 mr-10" src="../../../flag.png" />
          Report
        </div>
        <div className="report-menu-item" onClick={() => setReportVisible(false)}>
          <img className="size-20 mr-10" src="../../../close.png" style={{ padding: 2 }} />
          Cancel
        </div>
      </div>
      {/* <div className={`footer_home_bar footer_home_bar_mu padding_left_main${tipSectionVisible ? ' active' : ''}`}>
        <div className="footer_text_page_header footer_text_page next-prev-link">
          <Link href={{ pathname: `/novel/[slug]/chapter/[chapterslug]`, query: { slug: postSlug, chapterslug: nextChapterSlug, sort: sort } }}>
            <a className={!prevChapterSlug ? 'disabled' : ''}><img src="../../../Arrow_right_20.png" /></a>
          </Link>
          <Link href={{ pathname: `/novel/[slug]/chapter/[chapterslug]`, query: { slug: postSlug, chapterslug: prevChapterSlug, sort: sort } }}>
            <a className={!nextChapterSlug ? 'disabled' : ''}><img src="../../../Arrow_left_20.png" /></a>
          </Link>
        </div>
        <div className={`footer_text_page_content`}>
          <h2>Send Tip</h2>
          <ul>
            <li><a href="#">2<img src="../../../check.png" alt="images" /></a></li>
            <li><a href="#">5<img src="../../../check.png" alt="images" /></a></li>
            <li><a href="#">10<img src="../../../check.png" alt="images" /></a></li>
            <li><a href="#"><input type={"number"} className="custom-tip" placeholder="Custom" /></a></li>
          </ul>
        </div>
      </div> */}
      <div className="bar_font_details">
        <div className="click_bar">
          <span></span>
        </div>
        <div className="text_font_systems_area">
          <div className={`chapters-list${listVisible ? ' active' : ''}`}>
            {volumes?.length > 0 && volumes.map((volume, index) => (
              <React.Fragment key={index}>
                <h3 className="volume-name">{volume.name}</h3>
                <ul className="contents_page_chapter_menus">
                  {chapters.filter(c => c.volume_id === volume.id).map((chapter, index) => {
                    let icon = 'Arrow_right_20';
                    if (chapter.scope === 'unlock') {
                      icon = 'unlocked';
                    } else if (chapter.scope === 'premium') {
                      icon = 'locked';
                    }

                    return <li key={chapter.id}>
                      <div className={`chapter-item ${chapter.scope}`} onClick={() => handleChapterOpen(chapter)}>
                        <span className="cpchapter_left">
                          <span className="cpcphapter_number">{index + 1}</span>
                          <span className="cpchapter_content">{chapter.title}</span>
                        </span>
                        <span className="cpchapter_right"><img src={`../../../../${icon}.png`} alt="images" /></span>
                      </div>
                    </li>

                    {/* return <li key={index}>
                      {(chapter.scope === 'free' || chapter.scope === 'app' || chapter.scope === 'unlock') &&
                        <Link href={{ pathname: `/novel/[slug]/chapter/[chapterslug]`, query: { slug: postSlug, chapterslug: chapter.slug, sort: sort } }}>
                          <a>
                            <span className="cpchapter_left">
                              <span className="cpcphapter_number">{index + 1}</span>
                              <span className="cpchapter_content">{chapter.title}</span>
                            </span>
                            <span className="cpchapter_right"><img src={`../../../../${chapter.scope === 'free' || chapter.scope === 'app' ? 'Arrow_right_20' : 'unlocked'}.png`} alt="images" /></span>
                          </a>
                        </Link>
                      }
                      {chapter.scope === 'premium' &&
                        <div className="chapter-item" onClick={() => handleClickLockedChapter(chapter)}>
                          <span className="cpchapter_left">
                            <span className="cpcphapter_number">{index + 1}</span>
                            <span className="cpchapter_content">{chapter.title}</span>
                          </span>
                          <span className="cpchapter_right"><img src={`../../../../locked.png`} alt="images" /></span>
                        </div>
                      }
                    </li> */}
                  })}
                </ul>
              </React.Fragment>
            ))}
          </div>

          <div className={`font_controls${fontVisible ? ' active' : ''}`}>
            <ul className="font_family_select">
              {fonts.map((font, index) => (
                <li key={index} onClick={() => setFontFamily(font)}>
                  <a className={`${font.id === fontFamily.id ? 'active' : ''}`}><span>Aa</span> {font.name}</a>
                </li>
              ))}
            </ul>
            <div className="font_align_area">
              <div className="slide-wrapper">
                <img className="control" src="../../../line-reduce.svg" alt="" onClick={() => setParagraph(paragraph > 0 ? paragraph - 1 : paragraph)} />
                <input className="styled-slider slider-progress" type="range" min={0} max={6} step={1} value={paragraph} onChange={e => setParagraph(e.target.value)} list="ticks" />
                <img className="control" src="../../../line-expand.png" alt="" onClick={() => setParagraph(paragraph < 6 ? paragraph + 1 : paragraph)} />
              </div>
              <div className="slide-wrapper">
                <img className="control" src="../../../font-minus.png" alt="" onClick={() => setFontSize(fontSize > 0 ? fontSize - 1 : fontSize)} />
                <input className="styled-slider slider-progress" type="range" min={0} max={6} step={1} value={fontSize} onChange={e => setFontSize(e.target.value)} list="ticks" />
                <img className="control" src="../../../font-plus.png" alt="" onClick={() => setFontSize(fontSize < 6 ? fontSize + 1 : fontSize)} />
              </div>
              <datalist id="ticks">
                <option>0</option>
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
                <option>5</option>
                <option>6</option>
              </datalist>
            </div>
            <div className="color_select_area">
              <ul>
                <li><MyCheckBox onClick={e => changeTheme(e, 'black', '#000')} color="black" checked={theme === 'black'} /></li>
                <li><MyCheckBox onClick={e => changeTheme(e, 'yellow', '#ECE1CB')} color="yellow" checked={theme === 'yellow'} /></li>
                <li><MyCheckBox onClick={e => changeTheme(e, 'white', '#fff')} color="white" checked={theme === 'white'} /></li>
                <li><img className={`control${align == "left" ? " active" : ""}`} onClick={() => setAlign('left')} src="../../../align-left.png" alt="" /></li>
                <li><img className={`control${align == "justify" ? " active" : ""}`} onClick={() => setAlign('justify')} src="../../../align-justify.png" alt="" /></li>
                <li><img className={`control${align == "right" ? " active" : ""}`} onClick={() => setAlign('right')} src="../../../align-right.png" alt="" /></li>
              </ul>
            </div>
          </div>

          <div className="font_align_comment">
            <ul>
              <li>
                <button className="link-btn" onClick={() => { setListVisible(!listVisible); setFontVisible(false); setReportVisible(false); }}>
                  <img className="size-25" src="../../../align-justify.png" alt="" />
                </button>
              </li>
              <li>
                <button className="link-btn" onClick={() => { setFontVisible(!fontVisible); setListVisible(false); setReportVisible(false) }}>
                  <img src="../../../Text_settings.png" alt=""
                    className={`font-btn${fontVisible ? ' active' : ''} size-25`} />
                </button>
              </li>
              <li><button className="link-btn" onClick={() => router.push(`/novel/${postSlug}/chapter/${chapterSlug}/comments`)}>
                <img className="size-25" src="../../../Comments.png" alt="" />
              </button></li>

              <Link href={`/novel/${postSlug}/chapter/${prevChapterSlug}?sort=${sort}`}>
                <a className={!prevChapterSlug ? 'disabled' : ''}><img className="size-20" src="../../../Arrow_left_20.png" /></a>
              </Link>
              <Link href={`/novel/${postSlug}/chapter/${nextChapterSlug}?sort=${sort}`}>
                <a className={!nextChapterSlug ? 'disabled' : ''}><img className="size-20" src="../../../Arrow_right_20.png" /></a>
              </Link>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MangaChapterReadingFooter;