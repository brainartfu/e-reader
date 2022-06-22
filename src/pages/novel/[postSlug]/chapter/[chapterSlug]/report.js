
import { useState, useEffect } from 'react';
import Head from 'next/head'
import { useRouter } from 'next/router';
import api from 'lib/api';
import { useSession } from "next-auth/react";
import { Formik, Field, Form } from 'formik';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default function Report(props) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const postSlug = router.query.postSlug;
  const chapterSlug = router.query.chapterSlug;

  const [reportItems, setReportItems] = useState([]);
  const [othersVisible, setOthersVisible] = useState(false);
  const [reportText, setReportText] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    api.report.getItems().then(res => {
      setReportItems(res.data.reportSettingItems);
    });
  }, []);

  const handleSubmit = () => {
    if (content !== "") {
      api.report.save(postSlug, chapterSlug, content, session?.user.accessToken).then(res => {
        if (res.data.createChapterReport.status === 'success') {
          toast.success(res.data.createChapterReport.message);
        } else {
          toast.error(res.data.createChapterReport.message);
        }
      });
    }
  }

  const handleClickItem = content => {
    setOthersVisible(false);
    setContent(content);
  }

  const handleClickOthers = () => {
    setOthersVisible(true);
    setContent(reportText);
  }

  const handleChangeText = e => {
    setReportText(e.target.value);
    setContent(e.target.value);
  }

  return (
    <div>
      <Head>
        <title>Report</title>
        <meta name="description" content={`Report`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"report_page_content"} >
        <div className="header">
          <div className="book_profile_header_left">
            <button className="header-back-btn" onClick={() => router.back()}><img src="../../../../Arrow_left_20.png" /></button>
          </div>
          <div className="title">REPORT</div>
          <button type='button' className="post-btn" onClick={handleSubmit}>SUBMIT</button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', marginTop: 40 }}>
          <img src="../../../../flag.png" className='size-20 mr-10 ml-10' />
          <p>Why are you reporting this?</p>
        </div>

        <Formik initialValues={{ item: "" }}>
          <Form className='report-form mt-20'>
            {reportItems.map((item, index) =>
              <label className='report-item' key={index}>
                <Field type="radio" value={item} name="reportItem" onClick={e => handleClickItem(item)} />
                <span>{item}</span>
              </label>
            )}

            {reportItems.length > 0 &&
              <label className='report-item'>
                <Field type="radio" value="Other" name="reportItem" onClick={handleClickOthers} />
                <span>Other</span>
              </label>
            }

            {othersVisible && <div className="report-txt">
              <textarea rows={10} onChange={handleChangeText} value={reportText} ></textarea>
            </div>}
          </Form>
        </Formik>
      </main>
    </div>
  )
}
