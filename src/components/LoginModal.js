import Login from "pages/auth/login";
import { useEffect, useState } from "react";
import Modal from "./common/modal";

import ClosePng from 'assets/img/close.png';

const LoginModal = ({ open, setOpen, children }) => {
  const handleVisible = () => {
    if (setOpen) {
      setOpen(!open);
    }
  }
  return (
    <Modal open={open} setOpen={setOpen}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 20 }}>
        <img className="size-15" src={ClosePng.src} onClick={() => setOpen(false)} />
      </div>
      <Login setOpen={setOpen} />
    </Modal>
  );
};

export default LoginModal;