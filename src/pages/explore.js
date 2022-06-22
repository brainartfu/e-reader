import { useState, useEffect } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import { gql } from '@apollo/client';

import { initializeApollo } from 'lib/apollo-client';

import styles from '../styles/Home.module.css'

import ExploreHeader from '../components/explore-header';
import Footer from '../components/footer';
import UserReview from 'components/common/user-review';
import { Formik, Field, Form } from 'formik';
import { useRouter } from 'next/router';
import GenreSorter from 'components/common/genre-sorter';

export default function Explore({ page, posts, mangagenres }) {
  const router = useRouter();

  const { title, description } = page;
  const [keyword, setKeyword] = useState('');
  const [filteredPosts, setFilteredPost] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortVisible, setSortVisible] = useState(false);
  const [sort, setSort] = useState({
    sortBy: 'genre',
    asc: true
  });
  const sortOptions = [
    // { label: 'Sort By Genre', value: 'genre' },
    // { label: 'Sort By Status', value: 'mangaStatus' },
    { label: 'Sort By Title', value: 'title' },
    { label: 'Sort By Popularity', value: 'viewCount' },
    // { label: 'Sort By Rating', value: 'rating' },
  ];

  const getFirstGenre = post => {
    return post.wpmangagenres.nodes.sort((a, b) =>
      a.name.localeCompare(b.name)
    )[0]?.name;
  }

  const filterAndSort = () => {
    let filtered = posts.filter(p => p.title.toLowerCase().indexOf(keyword.toLowerCase()) > -1);
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(p => p.wpmangagenres.nodes.find(g => selectedGenres.indexOf(g.slug) > -1));
    }

    if (sort.sortBy === 'genre') {
      filtered = filtered.sort((a, b) => sort.asc ? getFirstGenre(a)?.localeCompare(getFirstGenre(b)) : getFirstGenre(b)?.localeCompare(getFirstGenre(a)));
    } else if (sort.sortBy === 'title' || sort.sortBy === 'mangaStatus') {
      filtered = filtered.sort((a, b) => sort.asc ? a[sort.sortBy].toString().localeCompare(b[sort.sortBy]) : b[sort.sortBy].toString().localeCompare(a[sort.sortBy]));
    } else {
      filtered = filtered.sort((a, b) => sort.asc ? a[sort.sortBy] - b[sort.sortBy] : b[sort.sortBy] - a[sort.sortBy]);
    }
    setFilteredPost(filtered);
  }

  useEffect(() => {
    if (router.query.genre) {
      setSelectedGenres([router.query.genre]);
    }
  }, [router.query.genre]);

  useEffect(() => {
    filterAndSort();
  }, [keyword, selectedGenres, sort]);

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={"ebook_reader_body explorer_pages_content"}>
        <ExploreHeader keyword={keyword} onSearch={setKeyword} sortVisible={sortVisible} setSortVisible={setSortVisible} />
        {sortVisible && <div className='sort-wrapper'>
          <div className='width-full'>
            <Formik initialValues={{ sort: 'genre' }}>
              <Form className='sort-form'>
                {sortOptions.map((o, i) =>
                  <label key={i}>
                    <Field type="radio" name="sort" value={o.value} onClick={() => setSort({ ...sort, sortBy: o.value })} />
                    {o.label}
                  </label>
                )}
              </Form>
            </Formik>
          </div>
          <div className='direction-btn' onClick={() => setSort({ ...sort, asc: !sort.asc })}>
            <img src='data.png' alt='sort' className={sort.asc ? 'asc' : 'desc'} />
          </div>
        </div>}
        <div className={"explore_menu_items_design mt-5"}>
          <GenreSorter genres={mangagenres} selected={selectedGenres} onChange={v => setSelectedGenres(v)} />
        </div>
        <div className={"explore_category_main_area mt-20"} style={{ marginBottom: 70 }}>
          <div className={"explore_categ_card_area"}>
            {filteredPosts && filteredPosts.length > 0 && filteredPosts.map((post, index) => {
              return (
                <div key={post.slug} className={"single_explore_items"}>
                  <div className={"single_explore_card"}>
                    <img className="single_explore_image" src={post.featuredImage?.node.sourceUrl.length > 0 ? post.featuredImage?.node.sourceUrl : "small_cover.png"} />
                  </div>
                  <div className={"single_explore_content"}>
                    <span>{post.wpmangagenres.nodes.map(v => v.name).join(', ')}</span>
                    <h4 className="manga-single-title">
                      <Link href={'/novel/' + post.slug}><a>{post?.title}</a></Link>
                    </h4>
                    <p>Author: {JSON.parse(post.mangaAuthors).map(v=>v.name).join(', ')}</p>
                    {/* <UserReview rating={post.rating} viewed={post.viewCount} files={post.mangaChapterCount} /> */}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <Footer />
      </main>
    </div>
  )
}

export async function getStaticProps() {
  const apolloClient = initializeApollo();

  let wpmangas = [];
  let after = '';
  let nextPage = false;
  do {
    const { data: result } = await apolloClient.query({
      query: gql`
        query WpmangasQuery ($first: Int, $after: String) {
          wpmangas(where: {status: PUBLISH}, first: $first, after: $after) {
            edges {
              node {
                id
                title
                slug
                rating
                viewCount
                mangaChapterCount
                mangaStatus
                featuredImage {
                  node {
                    id
                    sourceUrl
                  }
                }
                wpmangagenres {
                  nodes {
                    name
                    slug
                  }                
                }
                mangaAuthors
              }
            }
            pageInfo {
              endCursor
              hasNextPage
              hasPreviousPage
              startCursor
            }
          }
        }
      `, variables: {
        first: 3,
        after
      }
    });

    after = result.wpmangas.pageInfo.endCursor;
    nextPage = result.wpmangas.pageInfo.hasNextPage;
    wpmangas = [...wpmangas, ...result.wpmangas.edges.map(v => v.node)];
  } while (nextPage);

  const { data } = await apolloClient.query({
    query: gql`{
      generalSettings {
        title
        description
      }
      wpmangagenres {
        edges {
          node {
            id
            count
            name
            link
            slug
            uri
          }
        }
      }
    }
  `});

  return {
    props: {
      page: data?.generalSettings,
      mangagenres: data?.wpmangagenres.edges.map(v => v.node),
      posts: wpmangas,
    },
    revalidate: 10
  }
}
