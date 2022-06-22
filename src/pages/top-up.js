import React, { useState } from "react";
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Reviews from "components/Reviews";
import { PayPalButton } from "react-paypal-button-v2";
import styles from 'styles/Home.module.css'
import TopUpItem from "components/TopUp/TopUpItem";
import api from "lib/api";
import { useSession } from "next-auth/react";

const TopUp = ({ pointsConversions, paypalInfo }) => {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [paypalVisible, setPaypalVisible] = useState(false);
  const [currItem, setCurrItem] = useState({});

  const handleOnPay = (item) => {
    setPaypalVisible(true);
    setCurrItem(item);
  }

  const handlePay = (details, data) => {
    let transactionId = details.purchase_units[0].payments.captures[0].id;
    api.topUp.purchase(+currItem.money, +currItem.points, transactionId, session?.user.accessToken);
    setPaypalVisible(false);
    // alert("Transaction completed by " + details.payer.name.given_name);

    // OPTIONAL: Call your server to save the transaction
    return fetch("/paypal-transaction-complete", {
      method: "post",
      body: JSON.stringify({
        orderID: data.orderID
      })
    });
  }

  return (
    <div className={styles.container}>
      <Head>
        {/* <title>{post?.title}</title>
        <meta name="description" content={`Read more about ${post?.title} on ${site?.title}`} />
        <link rel="icon" href="/favicon.ico" /> */}
      </Head>

      <main className={"ebook_reader_body top-up"} >
        <div className="home_heading_design book_profile_header">
          <div className="book_profile_header_left">
            <button className="header-back-btn" onClick={() => router.back()}><img src="../../Arrow_left_20.png" /></button>
          </div>
        </div>

        {/* <h2 className="mt-20">Membership</h2>
        <div className="card mt-20">
          <div className="card-content">
            <div style={{ color: '#F6D278', fontSize: 12 }}>Get membership</div>
            <div className="head-row">
              <img className="size-20 mr-10" src="../check.png" alt="a" />
              <h2 className="mr-10">810</h2>
              <div style={{ flexGrow: 1 }}>Coins in value</div>
              <Link href="#"><a className="top-up-details">Details</a></Link>
              <img className="size-20" src="../../Arrow_right_20.png" />
            </div>
            <div className="button-wrapper">
              <button className="card-btn mt-10 width-full">
                <span>Obtain <b>500 Coins</b> at once</span>
              </button>
              <button className="card-btn mt-10 width-full">
                Earn an additional <b>310 Coins a month</b> (from daily login)
              </button>
            </div>
            <p className="text-center mt-10">1st Month Special</p>
          </div>
          <div className="card-footer">
            <p style={{ textDecoration: 'line-through' }}>USD 9.99/Month</p>
            <b>USD 7.99/Month</b>
          </div>
        </div> */}

        <h2 className="mt-20">Top Up</h2>
        <div className="top-up-row">
          {Object.keys(pointsConversions).map((key, index) =>
            <TopUpItem
              points={pointsConversions[key].points}
              money={pointsConversions[key].money}
              discount={pointsConversions[key].discount}
              key={index}
              onPay={handleOnPay}
            />
          )}
        </div>
      </main>

      <div className={`paypal-wrapper${paypalVisible ? ' active' : ''}`} onClick={() => setPaypalVisible(false)}>
        <div className="content">
          <div className="info">
            <p className="mb-10">Points: {currItem.points}</p>
            <p className="mb-10">Money: USD {currItem.money}</p>
          </div>
          <div>
            <PayPalButton
              className="paypal-modal"
              amount={currItem.money}
              // shippingPreference="NO_SHIPPING" // default is "GET_FROM_FILE"
              onSuccess={handlePay}
              options={{
                clientId: paypalInfo.paypalClientId
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopUp;

export async function getStaticProps() {
  const { data } = await api.topUp.get();
  const paypalInfo = await api.paypal.getInfo();

  return {
    props: {
      pointsConversions: JSON.parse(data.pointsConversions),
      paypalInfo: paypalInfo.data
    },
    revalidate: 10
  }
}