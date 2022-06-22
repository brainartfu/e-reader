import { Formik, useFormik } from 'formik';
import Head from 'next/head';
import { useRouter } from 'next/router';
import React from 'react';
import * as Yup from 'yup';
import { gql, useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { initializeApollo } from 'lib/apollo-client';

import styles from '../../assets/css/login.module.scss';

const initialValues = { email: '' };
const uuid = uuidv4();
const apolloClient = initializeApollo();

const LOST_PASSWORD = gql`
  mutation lostpassword($email: String!, $uuid: String!) {
    lostpassword(
      input: {
        clientMutationId: $uuid
        email: $email,
    }) {
      status
      message
    }  
  }
`;

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Wrong email format')
    .min(3, 'Minimum 3 symbols')
    .max(50, 'Maximum 50 symbols')
    .required('This field is required')
});

function ForgotPassword() {
  const router = useRouter();
  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: ForgotPasswordSchema,
    onSubmit: (values, { setErrors, setSubmitting }) => {
      lostPassword({
        variables: {
          uuid: uuid,
          email: values.email
        },
      })
    }
  });

  const getInputClasses = (fieldname) => {
    if (formik.touched[fieldname] && formik.errors[fieldname]) {
      return styles.errorInput;
    }

    if (formik.touched[fieldname] && !formik.errors[fieldname]) {
      return styles.validInput;
    }

    return '';
  };
  const [lostPassword, { data, loading, error }] = useMutation(LOST_PASSWORD, {
    onCompleted: res => {
      formik.setSubmitting(false);
      if (res.lostpassword.status === 'success') {
        alert('Your new password has been sent to the email.');
        router.push('/auth/login');
      } else if (res.lostpassword.status === "invalid_email") {
        formik.setErrors({ email: res.lostpassword.message });
      } else if (res.lostpassword.status !== undefined) {
        formik.setErrors({ email: res.lostpassword.message });
      } else {
        formik.setErrors({ email: 'Server error. please contact to admin' });
      }
    },
    onError: error => {
      if (error.response) {
        if (error.response.status === 422) {
          formik.setErrors({ email: 'Invalid email, please try again' });
        } else {
          formik.setErrors({
            email: 'Server error. please contact to admin'
          });
        }
        setSubmitting(false);
      } else {
        formik.setErrors({ email: 'Server error. please contact to admin' });
        setSubmitting(false);
      }
    }, client: apolloClient
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Frontrow Lenders&apos; Portal</title>
      </Head>
      <div className={styles.backBtn}>
        <img src="../Arrow_left_20.png" onClick={() => router.back()} alt="" />
      </div>
      <div className={styles.loginMain} style={{ display: 'block' }}>
        <div className='logo'>
          <img src="../logo.png" alt="" />
        </div>
        <div className="text-center mb-10 mb-lg-20">
          <h1 className="font-size-h1 mt-30">Forgotten Password ?</h1>
          <div className="text-muted font-weight-bold mt-20" style={{ marginBottom: 20 }}>Enter your email to reset your password.</div>
        </div>
        <div className={styles.loginStep}>
          <form onSubmit={formik.handleSubmit} className={styles.loginForm}>
            {formik.status && (
              <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
                <div className="alert-text font-weight-bold">
                  {formik.status}
                </div>
              </div>
            )}
            <div className="form-group fv-plugins-icon-container">
              <div className='input-wrapper'>
                <input
                  type="email"
                  className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses('email')}`}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  name="email"
                />
                <div className='prefix'><img className='size-20' src="../envelope.png" alt="" /></div>
              </div>

              {formik.touched.email && formik.errors.email ? (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">{formik.errors.email}</div>
                </div>
              ) : undefined}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
              <button type="submit" className='register-button' disabled={formik.isSubmitting}>
                {formik.isSubmitting ? <>Processing...</> : <>Submit</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
