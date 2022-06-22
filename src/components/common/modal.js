import { useEffect, useState } from "react";

const Modal = ({ open, setOpen, children }) => {
  const handleVisible = () => {
    if (setOpen) {
      setOpen(!open);
    }
  }
  return (
    <div className={`custom-modal${open ? ' opened' : ''}`} onClick={handleVisible}>
      <div className="content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
};

export default Modal;