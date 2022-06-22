import TimedRewardItem from "./timed-reward-item";

const TimedRewards = ({ open, setOpen, rewards }) => {

  return (
    <div className={`timed-rewards${open ? ' opened' : ''}`} onClick={() => setOpen(!open)}>
      <div className="content" onClick={e => e.stopPropagation()}>
        <h1 className="text-center">Timed Rewards</h1>
        {rewards.length > 0 && rewards.map(reward =>
          <TimedRewardItem reward={reward} key={reward.id} />
        )}
      </div>
    </div>
  );
};

export default TimedRewards;