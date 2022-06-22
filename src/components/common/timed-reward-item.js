import api from "lib/api";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useTimer } from 'react-timer-hook';
import { toast } from "react-toastify";

const TimedRewardItem = ({ reward }) => {
  const { data: session, status: sessionStatus } = useSession();

  const expiryTimestamp = new Date(reward.next_claim_date);
  expiryTimestamp.setMinutes(expiryTimestamp.getMinutes() - new Date().getTimezoneOffset());

  const [expired, setExpired] = useState(false);

  const { hours, minutes, seconds, restart } = useTimer({
    expiryTimestamp,
    onExpire: () => {
      setExpired(true);
    }
  });

  const handleClaim = () => {
    api.rewards.claim(reward.id, session?.user.accessToken).then(res => {
      const claim = JSON.parse(res.data.timeBasedRewardsClaim.next_claim);
      const d = new Date();
      d.setHours(d.getHours() + claim.hours);
      d.setMinutes(d.getMinutes() + claim.minutes);
      d.setSeconds(d.getSeconds() + claim.seconds);
      restart(d);
      setExpired(false);

      if (res.data.timeBasedRewardsClaim.status === 'success') {
        toast.success(res.data.timeBasedRewardsClaim.message);
      } else {
        toast.error(res.data.timeBasedRewardsClaim.message);
      }
    });
  };

  return (
    <div className="rewards-item">
      <div className="title">
        <img className="size-20 mr-10" src="clock.png" alt="time" />
        <div>{reward.title}</div>
      </div>
      <h1 className="time">
        <div>{hours}H {minutes}M {seconds}S</div>
      </h1>
      {reward.rewards.length > 0 && reward.rewards.map((rew, ind) => {
        if (rew.min > 0) {
          return <div className="ticket" key={ind}>
            <img className="size-20 mr-10" src="check3.png" alt="time" />
            <h2>{rew.singular_name} +{rew.min === rew.max ? rew.max : `(${rew.min},${rew.max})`}</h2>
          </div>
        }
      })}
      <div className={`footer${!reward.can_claim && !expired ? ' disabled' : ''}`} onClick={handleClaim}>
        <h2 className="text-black">{reward.claim_button_text}</h2>
      </div>
    </div>
  );
};

export default TimedRewardItem;