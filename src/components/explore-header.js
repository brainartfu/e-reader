import SingleSearchForm from "./common/single-search-form";

const ExploreHeader = ({ keyword, onSearch, sortVisible, setSortVisible }) => {
  return (
    <div className={"explore_heading_design"}>
      <SingleSearchForm placeholder="Suggested book title" onSearch={onSearch} keyword={keyword} />
      <button className="link-btn ml-10" onClick={e => setSortVisible(!sortVisible)}><img src="Filters.png" alt="" /></button>
    </div>
  );
};

export default ExploreHeader;