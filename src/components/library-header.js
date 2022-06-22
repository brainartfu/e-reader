const LibraryHeader = ({ setTimedRewardsVisible }) => {
  //Function that set active link 
  const setActiveLink = (e) => {
    //Get all links
    const links = document.querySelectorAll('.tab-link');
    const elements = document.querySelectorAll('.tab-content');
    // //Loop through all links
    var tabdata = e.target.dataset.tab;

    links.forEach(link => {
      //Remove active class from all links
      link.classList.remove('active');
      link.parentElement.classList.remove('active');
    });

    elements.forEach(el => {
      //Hide all elements
      el.classList.remove('active');
    })

    //check if tabdata is undefined
    if (tabdata) {
      //Show the element with the tabdata
      tabdata = tabdata;
      //Add active class to the link
    } else {
      tabdata = e.target.parentElement.dataset.tab;

    }
    e.target.classList.add('active');
    e.target.parentElement.classList.add('active');
    document.getElementById(tabdata).classList.add('active');
  }

  return (
    <div className="reading_heading_design">
      <div className="reading_left_tabs">
        <ul>
          <li className="tab-link active" data-tab="tab1" onClick={(e) => setActiveLink(e)}>Reading</li>
          <li className="tab-link" data-tab="tab2" onClick={(e) => setActiveLink(e)}>Bookmarks</li>
          <li className="slider" />
        </ul>
      </div>
      <div>
        <a href="/announcements" className="link-btn ml-10"><img className="size-25" src="/crown.png" alt="" /></a>
        <button onClick={() => setTimedRewardsVisible(true)} className="link-btn ml-10"><img className="size-25" src="gift.png" alt="" /></button>
        {/* <button className="link-btn ml-10"><img className="size-25" src="Dots_menu.png" style={{ marginTop: 8, width: 18 }} alt="" /></button> */}
      </div>
    </div>
  );
}

export default LibraryHeader;