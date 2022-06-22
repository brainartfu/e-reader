import { useEffect, useState } from "react";

const SingleSearchForm = props => {
  const { placeholder, onSubmit, onSearch, keyword } = props;
  const [search, setSearch] = useState("");

  const handleSubmit = e => {
    if (onSubmit) {
      onSubmit();
    }
  }
  useEffect(() => {
    if (onSearch) {
      onSearch(search);
    }
  }, [search]);

  useEffect(() => {
    setSearch(keyword);
  }, [keyword]);

  return (
    <form action="#" method="POST" style={{ flexGrow: 1 }}>
      <div className={"single-search-form"}>
        <button type="button" onClick={handleSubmit}><i className={"fal fa-search"}></i></button>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} className="width-full" placeholder={placeholder} />
      </div>
    </form>
  );
};

export default SingleSearchForm;