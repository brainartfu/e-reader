import { useEffect, useState } from "react";

const MyCheckBox = ({ color, checked, onClick }) => {

  return (
    <img onClick={onClick} src={`../../../check-${color}${checked ? '-checked' : ''}.png`} alt="check" />
  );
};

export default MyCheckBox;