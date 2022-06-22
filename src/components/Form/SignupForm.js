import { useFormik } from 'formik';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { signIn } from 'next-auth/react';
import React, { useState } from 'react';
// import {
//   LoadCanvasTemplate,
//   loadCaptchaEnginge,
//   validateCaptcha
// } from 'react-simple-captcha';
import * as Yup from 'yup';

const initialValues = {
  email: '',
  name: '',
  password: '',
  changepassword: '',
  referralcode:'',
  acceptTerms: true
};

function SignupForm({ styles }) {
  /* eslint-disable sonarjs/no-duplicate-string */
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const RegistrationSchema = Yup.object().shape({
    email: Yup.string()
      .email('Wrong email format')
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('This field is required'),
    name: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('This field is required'),
    password: Yup.string()
      .min(3, 'Minimum 3 symbols')
      .max(50, 'Maximum 50 symbols')
      .required('This field is required'),
    changepassword: Yup.string()
      .required('This field is required')
      .when('password', {
        is: val => (val && val.length > 0 ? true : false),
        then: Yup.string().oneOf(
          [Yup.ref('password')],
          "Password and Confirm Password didn't match"
        )
      }),
    // acceptTerms: Yup.bool().required('You must accept the terms and conditions')
  });

  const enableLoading = () => {
    setLoading(true);
  };

  const disableLoading = () => {
    setLoading(false);
  };

  const getInputClasses = fieldname => {
    if (formik.touched[fieldname] && formik.errors[fieldname]) {
      return styles.errorInput;
    }

    if (formik.touched[fieldname] && !formik.errors[fieldname]) {
      return styles.validInput;
    }

    return '';
  };

  const formik = useFormik({
    initialValues,
    validationSchema: RegistrationSchema,
    onSubmit: (values, { setErrors, setSubmitting }) => {
      enableLoading();
      // let user_captcha_value = document.querySelector(
      //   '#user_captcha_input'
      // ).value;

      // if (validateCaptcha(user_captcha_value) === false) {
      //   alert('Captcha Does Not Match');
      //   document.querySelector('#user_captcha_input').value = '';
      //   setSubmitting(false);
      //   disableLoading();
      //   return;
      // }
      signIn('register', {
        name: values.name,
        email: values.email,
        password: values.password,
        referralcode: values.referralcode,
        redirect: false
        // callbackUrl: `${window.location.origin}/admin/dashboard`
      }).then(res => {
        if (res.error) {
          console.log(res.error)
          const error = JSON.parse(res.error);
          const usernameExistsRegex = /This username is already registered. Please choose another one/g;
          const invalidUsernameRegex = /((This username is invalid because it uses illegal characters. Please enter a valid username)|(Sorry, that username is not allowed))/g;
          const emailExistsRegex = /This email address is already registered/g;
          const invalidEmailRegex = /The email address isn&#8217;t correct/g;
          if (error.search(usernameExistsRegex) > -1) {
            setErrors({ name: 'This username is already registered. Please choose another one' });
          } else if (error.search(invalidUsernameRegex) > -1) {
            setErrors({ name: 'This username is invalid' });
          } else if (error.search(emailExistsRegex) > -1) {
            setErrors({ email: 'This email address is already registered' });
          } else if (error.search(invalidEmailRegex) > -1) {
            setErrors({ email: 'The email address isn\'t correct' });
          }
          setSubmitting(false);
          disableLoading();
        } else {
          router.push('/');
        }
      });
    }
  });
  // useEffect(() => {
  //   loadCaptchaEnginge(6);
  // }, []);
  return (
    <div className={styles.loginStep} style={{ marginTop: 0 }}>
      <form
        id="kt_login_signin_form"
        className={styles.loginForm}
        onSubmit={formik.handleSubmit}
      >
        {/* begin: Alert */}
        {formik.status && (
          <div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
            <div className="alert-text font-weight-bold">{formik.status}</div>
          </div>
        )}
        {/* end: Alert */}

        {/* begin: Email */}
        <div className={"input-wrapper form-group fv-plugins-icon-container " + styles.formGroup}>
          <input
            placeholder="Email"
            type="email"
            className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
              'email'
            )}`}
            name="email"
            {...formik.getFieldProps('email')}
          />
          <div className='prefix'><img className='size-20' src="../envelope.png" alt="" /></div>
          {formik.touched.email && formik.errors.email ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">{formik.errors.email}</div>
            </div>
          ) : undefined}
        </div>
        {/* end: Email */}

        {/* begin: name */}
        <div className={"input-wrapper form-group fv-plugins-icon-container " + styles.formGroup}>
          <input
            placeholder="Name"
            type="text"
            className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
              'name'
            )}`}
            name="name"
            {...formik.getFieldProps('name')}
          />
          <div className='prefix'><img className='size-20' src="../user.png" alt="" /></div>
          {formik.touched.name && formik.errors.name ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">{formik.errors.name}</div>
            </div>
          ) : undefined}
        </div>
        {/* end: Username */}

        {/* begin: Password */}
        <div className={"input-wrapper form-group fv-plugins-icon-container " + styles.formGroup}>
          <input
            placeholder="Password"
            type="password"
            className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
              'password'
            )}`}
            name="password"
            {...formik.getFieldProps('password')}
          />
          <div className='prefix'><img className='size-20' src="../locked.png" alt="" /></div>
          {formik.touched.password && formik.errors.password ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">{formik.errors.password}</div>
            </div>
          ) : undefined}
        </div>
        {/* end: Password */}

        {/* begin: Confirm Password */}
        <div className={"input-wrapper form-group fv-plugins-icon-container " + styles.formGroup}>
          <input
            placeholder="Confirm Password"
            type="password"
            className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
              'changepassword'
            )}`}
            name="changepassword"
            {...formik.getFieldProps('changepassword')}
          />
          <div className='prefix'><img className='size-20' src="../locked.png" alt="" /></div>
          {formik.touched.changepassword && formik.errors.changepassword ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">
                {formik.errors.changepassword}
              </div>
            </div>
          ) : undefined}
        </div>
        {/* end: Confirm Password */}

        {/* begin: Referral code */}
        <div className={"input-wrapper form-group fv-plugins-icon-container " + styles.formGroup}>
          <input
            placeholder="Referral Code(Optional)"
            type="text"
            className={`form-control form-control-solid h-auto py-5 px-6 ${styles.referralCode}`}
            name="referralcode"
            {...formik.getFieldProps('referralcode')}
          />
          <div className='prefix'><img className='size-20' src="../locked.png" alt="" /></div>
        </div>
        {/* end: Confirm Password */}

        {/* begin: Terms and Conditions */}
        <div className={`form-group ${styles.terms}`} style={{ marginTop: 20 }}>
          <label className="checkbox" style={{ display: 'flex', alignItems: 'center' }}>
            <span>By tapping Create Account, I agree to Ricecake's <Link href={`terms`}><a>Terms of Service</a></Link> and <Link href={`privacy-policy`}><a>Privacy Policy</a></Link>.
            </span>
          </label>
          {formik.touched.acceptTerms && formik.errors.acceptTerms ? (
            <div className="fv-plugins-message-container">
              <div className="fv-help-block">{formik.errors.acceptTerms}</div>
            </div>
          ) : undefined}
        </div>
        {/* <LoadCanvasTemplate /> */}
        {/* <div>
          <input
            placeholder="Enter Captcha Value"
            id="user_captcha_input"
            name="user_captcha_input"
            type="text"
          ></input>
        </div> */}
        {/* end: Terms and Conditions */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button className="register-button" type="submit" disabled={formik.isSubmitting}>
            {/* <span>Submit</span> */}
            {formik.isSubmitting ? <>Registering...</> : <>Create Account</>}
            {/* {loading && <span className="ml-3 spinner spinner-white"></span>} */}
          </button>

          {/* <div className={styles.otherLinks}>
            <Link href="/auth/login">
              <a data-nsfw-filter-status>Cancel</a>
            </Link>
          </div> */}
        </div>
      </form>
    </div>
  );
}

export default SignupForm;
