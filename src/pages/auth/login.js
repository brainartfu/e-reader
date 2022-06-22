import { Formik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn, getCsrfToken } from 'next-auth/react';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { removeLocalBookmark } from "utils/common";
import styles from '../../assets/css/login.module.scss';

import LogoPng from 'assets/img/logo.png';
import EnvelopePng from 'assets/img/envelope.png';
import LockedPng from 'assets/img/locked.png';
import EyePng from 'assets/img/eye.png';
import EyeNoPng from 'assets/img/eye-no.png';


const initialValues = { email: '', password: '' };

export default function Login({ csrfToken, setOpen }) {
  const [loginError, setLoginError] = useState('');
  const [passwordShowed, setPasswordShowed] = useState(false);
  const router = useRouter();
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('This field is required'),
    password: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('This field is required')
  });

  useEffect(() => {
    if (router.query.error) {
      setLoginError('Invalid email or password');
      // setEmail(router.query.email);
    }
  }, [router]);

  const getInputClasses = (formik, fieldname) => {
    if (formik.touched[fieldname] && formik.errors[fieldname]) {
      return styles.errorInput;
    }

    if (formik.touched[fieldname] && !formik.errors[fieldname]) {
      return styles.validInput;
    }

    return '';
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>E book&apos; Portal</title>
      </Head>
      {/* <div className={styles.backBtn}>
        <img src="../Arrow_left_20.png" onClick={() => router.push('/')} alt="" />
      </div> */}
      <main className={styles.loginMain}>
        <div className='logo'>
          <img src={LogoPng.src} alt="" />
        </div>
        <div className={styles.loginStep}>
          <Formik
            initialValues={initialValues}
            validationSchema={LoginSchema}
            onSubmit={(values, { setErrors, setSubmitting }) => {
              signIn('login', {
                email: values.email,
                password: values.password,
                redirect: false
              }).then(res => {
                if (res.error) {
                  setErrors({ email: 'Invalid email or password' });
                  setSubmitting(false);
                } else {
                  // router.push('/profile');
                  router.back();
                  removeLocalBookmark();
                }
                setOpen(false); // it will hide login modal when logged in.
              });
            }}
          >
            {props => (
              <form onSubmit={props.handleSubmit} className={styles.loginForm}>
                <input
                  name="csrfToken"
                  type="hidden"
                  defaultValue={csrfToken}
                />
                <div className='input-wrapper'>
                  <input
                    id="loginEmail"
                    placeholder="Email"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.email}
                    className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(props, 'email')}`}
                    name="email"
                  />
                  <div className='prefix'><img className='size-20' src={EnvelopePng.src} alt="" /></div>
                </div>
                {props.touched.email && props.errors.email ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{props.errors.email}</div>
                  </div>
                ) : undefined}
                <span className={styles.error} data-nsfw-filter-status>{loginError}</span>

                <div className='input-wrapper'>
                  <input
                    id="inputPassword"
                    type={passwordShowed ? "text" : "password"}
                    name="password"
                    placeholder="Password"
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    value={props.values.password}
                    className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(props, 'password')}`}
                  />
                  <div className='prefix'><img className='size-20' src={LockedPng.src} alt="" /></div>
                  <div className='suffix'><img className='size-20' onClick={() => setPasswordShowed(!passwordShowed)} src={passwordShowed ? EyePng.src : EyeNoPng.src} alt="" /></div>
                </div>
                {props.touched.password && props.errors.password ? (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">{props.errors.password}</div>
                  </div>
                ) : undefined}

                <div className="login-buttons mt-20">
                  <Link href="/auth/signup"><a className="sign-up-btn primary">Sign up</a></Link>
                  <button className="login-btn secondary" type="submit" disabled={props.isSubmitting}>{props.isSubmitting ? 'Logging...' : 'Log In'}</button>
                </div>
              </form>
            )}
          </Formik>

          <Link href="/auth/forgot-password"><a className="mt-30 mb-20 text-center" style={{ display: 'inline-block', color: '#8c929f' }}>Forgot passwords?</a></Link>
          {/* <hr style={{ borderTop: '1px solid lightgrey', marginTop: 20 }} />
          <p className="mt-10 text-center" style={{ fontSize: 12, marginTop: -20, background: "#080809", color: "#8C929F", width: 100, margin: "-20px auto 0" }}>OR Log in with </p>
          <div className="mt-20 social-buttons">
            <button className="social-btn facebook"></button>
            <button className="social-btn twitter"></button>
            <button className="social-btn google-plus"></button>
            <button className="social-btn apple"></button>
          </div>
          <p className="mt-20 text-center" style={{ paddingBottom: 60 }}>By continuing, you agree to our Terms of Service and Privacy Policy.</p> */}

        </div>
      </main>
    </div>
  );
}
export async function getServerSideProps(context) {
  const c = await getCsrfToken(context)
  return {
    props: {
      csrfToken: c ? c : null
    },
  };
}