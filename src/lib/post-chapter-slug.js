import { gql } from '@apollo/client';
import { initializeApollo } from "./apollo-client";

export async function getPostChapterSlugPaths() {
  const apolloClient = initializeApollo();
  let posts = [];
  let after = '';
  let nextPage = false;
  do {
    const data = await apolloClient.query({
      query: gql`
        query WpmangasQuery ($first: Int, $after: String){
          wpmangas(where: {status: PUBLISH},first: $first, after: $after) {
            nodes {
              mangaChaptersList {
                slug
              }
              slug
            }            
            pageInfo {
              endCursor
              hasNextPage
              hasPreviousPage
              startCursor
            }
          }
        }
      `,
      variables: {
        first: 100,
        after
      }
    });
    after = data?.data.wpmangas.pageInfo.endCursor;
    nextPage = data?.data.wpmangas.pageInfo.hasNextPage;
    posts = [...posts, ...data?.data.wpmangas.nodes]; // posts.concat(data?.data.wpmangas.nodes.map(({ node }) => node));
  } while (nextPage)

  let paths = [];
  posts.map(post => {
    post.mangaChaptersList.map(chapter => {
      paths.push({ params: { postSlug: "post.slug", chapterSlug: "chapter.slug" } });
    })
  });

  return {
    paths: paths,
    fallback: true
  }
}