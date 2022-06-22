import dynamic from 'next/dynamic';
import Head from 'next/head';
import React from 'react';
import { useRouter } from 'next/router';
import styles from '../../assets/css/login.module.scss';

const SignupForm = dynamic(() => import('../../components/Form/SignupForm'), {
  ssr: false
});
function Registration() {
  const router = useRouter();
  return (
    <div className={styles.container}>
      <Head>
        <title>E reader&apos; Portal</title>
      </Head>
      <div className={styles.backBtn}>
        <img src="../Arrow_left_20.png" onClick={() => router.back()} alt="" />
      </div>
      <div className={styles.loginMain}>
        <div className='logo' style={{ marginTop: 20 }}>
          <img src="../logo.png" alt="" />
        </div>
        <div className="text-center mb-10 mb-lg-20">
          <h1 className="font-size-h1 mt-20">Sign up</h1>
          <p className="text-muted font-weight-bold">
            Enter your details to create your account
          </p>
        </div>
        <SignupForm styles={styles} />
      </div>
    </div>
  );
}

export default Registration;
