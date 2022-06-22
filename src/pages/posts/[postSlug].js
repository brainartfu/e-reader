import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';

import { initializeApollo } from 'lib/apollo-client';

import styles from '../../styles/Home.module.css'

export default function Post({ post, site }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{ post?.title }</title>
        <meta name="description" content={`Read more about ${post?.title} on ${site?.title}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main} >
        <h1 className={styles.title}>
          { post?.title }
        </h1>

        <div className={styles.grid}>
          <div className={styles.content} dangerouslySetInnerHTML={{
            __html: post.content
          }} />
        </div>

        <p className={styles.backToHome}>
          <Link href="/">
            <a>
              &lt; Back to home
            </a>
          </Link>
        </p>
      </main>
    </div>
  )
}

export async function getStaticProps({ params = {} } = {}) {
  const { postSlug } = params;

  const apolloClient = initializeApollo();

  const data = await apolloClient.query({
    query: gql`
      query PostBySlug($slug: String!) {
        generalSettings {
          title
        }
        wpmangaBy(slug: $slug) {
          id
          content
          title
          slug
        }
      }
    `,
    variables: {
      slug: postSlug
    }
  });

  const post = data?.data.wpmangaBy;

  const site = {
    ...data?.data.generalSettings
  }

  return {
    props: {
      post,
      site
    },
    revalidate: 10
  }
}

export async function getStaticPaths() {
  const apolloClient = initializeApollo();

  const data = await apolloClient.query({
    query: gql`
      {
        wpmangas(first: 10000) {
          edges {
            node {
              id
              title
              slug
            }
          }
        }
      }
    `,
  });

  const posts = data?.data.wpmangas.edges.map(({ node }) => node);

  return {
    paths: posts.map(({ slug }) => {
      return {
        params: {
          postSlug: slug
        }
      }
    }),
    fallback: false
  }
}