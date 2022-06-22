import React from "react";
import { useRouter } from 'next/router';

const TopUpItem = ({ points, money, discount, onPay }) => {
  const router = useRouter();

  const coin = points / 100 * discount;

  const handlePay = () => {
    if (onPay) {
      onPay({ points: points * 1 + coin, money });
    }
  }

  return (
    <div className="card mt-20">
      <div className="card-content">
        <div style={{ color: '#FF7666', fontSize: 12, textAlign: 'right', height: 14 }}>{+discount !== 0 ? `+${discount}%` : ''}</div>
        <div className="head-row">
          <img className="size-20 mr-10" src="../check.png" alt="a" />
          <h2 className="">{(points * 1).toLocaleString()}</h2>
        </div>
        <div className="button-wrapper mb-5">
          {coin !== 0 && <button className="card-btn mt-10 text-center">
            <b>+ {coin.toLocaleString()} Coins</b>
          </button>}
        </div>
      </div>
      <div className="card-footer" onClick={handlePay}>
        <b>USD {money}</b>
      </div>
    </div>
  )
}
export default TopUpItem;