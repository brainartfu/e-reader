import { useEffect, useState } from "react";

const GenreSorter = ({ genres, selected, onChange }) => {

  const handleAddToSelected = v => {
    onChange([...selected, v]);
  }
  const handleRemovedFromSelected = v => {
    onChange(selected.filter(item => item !== v));
  }

  return (
    <div className={"explore_menu"}>
      {genres && genres.length > 0 && (
        <ul>
          {genres.filter(v => selected.indexOf(v.slug) > -1).map((genre, index) =>
            <li key={genre.slug} data-slug={genre.slug} className="selected">
              <button onClick={() => handleRemovedFromSelected(genre.slug)}>
                {genre.name}
                <img src="cross.png" alt="" />
              </button>
            </li>
          )}
          {genres.filter(v => selected.indexOf(v.slug) < 0).map((genre, index) =>
            <li key={genre.slug} data-slug={genre.slug}>
              <button onClick={() => handleAddToSelected(genre.slug)}>{genre.name}</button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default GenreSorter;
