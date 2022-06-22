import ScaleLoader from "react-spinners/ScaleLoader";
import { css } from "@emotion/react";

const Loader = () => {
  
  const override = css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `;
  
  return (
    <ScaleLoader color="#666" loading={true} css={override} height={50} width={2} radius={10} margin={5} />
  );
};

export default Loader;