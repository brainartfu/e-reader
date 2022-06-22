import React from 'react';
import { useRouter } from 'next/router';
import Loader from "components/common/loader"

const Fallback = PageContent => props => {
  const router = useRouter();

  return router.isFallback
    ? <Loader />
    : <PageContent {...props} />;
}
export default Fallback;