import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useSession, getSession } from "next-auth/react"
import { initializeApollo, addApolloState } from 'lib/apollo-client';
import { gql, useQuery } from '@apollo/client';

import { useRouter } from 'next/router';
import api from 'lib/api';

import BackwardPng from 'assets/img/backward.png';

const HISTORY_QUERY = gql`
  query GetPurchaseHistory ($id: ID!) {
    user(id: $id) {
      purchaseHistory
    }
  }
`;

export default function PurchaseHistory(props) {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();

  const { loading, error, data: res, networkStatus } = useQuery(
    HISTORY_QUERY,
    {
      variables: {
        id: session?.user.id
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const data = !res ? {} : JSON.parse(res.user.purchaseHistory);

  return (
    <div>
      <Head>
        <title>Purchase History</title>
        <meta name="description" content="Purchase History" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='page'>
        <div className='page-header'>
          <img className="size-20" src={BackwardPng.src} onClick={() => router.back()} />
          <h2 className='title'>PURCHASE HISTORY</h2>
        </div>

        <div className='page-content'>
          <ul className='purchase-history'>
            {data.length > 0 && data.map((item, index) =>
              <li key={index}>
                <div>
                  <div>{new Date(item.date).toLocaleDateString()}</div>
                  <div className='mt-10'>{item.gateway === 'paypal_standard' ? 'Paypal' : item.gateway}</div>
                  <p className='mt-10'>USD {(item.total * 1).toLocaleString()}</p>
                </div>
                <div>{(item.items[0].quantity * 1).toLocaleString()}</div>
              </li>
            )}
          </ul>
        </div>
      </main>
    </div>
  )
}

export async function getServerSideProps({ req, res }) {
  const session = await getSession({ req });
  const apolloClient = initializeApollo(null, session?.user.accessToken, true);

  await apolloClient.query({
    query: HISTORY_QUERY,
    variables: {
      id: session?.user.id
    }
  });

  return addApolloState(apolloClient, {
    props: {},
  });
}
