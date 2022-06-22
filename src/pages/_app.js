import Head from 'next/head'
import { SessionProvider } from "next-auth/react"
import { ApolloProvider } from '@apollo/client';
import { CommentProvider } from 'context/comment-context';

import { useApollo } from '../lib/apollo-client';
import { ToastContainer } from 'react-toastify';

import '../styles/globals.css'
import "../assets/css/import.css"
import "../assets/css/normalize.css"
import "../assets/css/responsive.css"
import "../assets/css/style.css"
import "../assets/css/range-input.css"

function MyApp({
  Component,
  pageProps: {
    session, ...pageProps
  }
}) {
  const apolloClient = useApollo(pageProps, session?.user.accessToken);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
        />
        <meta name="description" content="Description" />
        <meta name="keywords" content="Keywords" />
        <title>E Reader</title>

        <link rel="manifest" href="/manifest.json" />
        <link
          href="/icons/favicon-16x16.png"
          rel="icon"
          type="image/png"
          sizes="16x16"
        />
        <link
          href="/icons/favicon-32x32.png"
          rel="icon"
          type="image/png"
          sizes="32x32"
        />
        <link rel="apple-touch-icon" href="/apple-icon.png"></link>
        <meta name="theme-color" content="#317EFB" />
      </Head>
      <SessionProvider session={session}>
        <ApolloProvider client={apolloClient}>
          <CommentProvider>
            <Component {...pageProps} />

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </CommentProvider>
        </ApolloProvider>
      </SessionProvider>
    </>
  )
}

export default MyApp