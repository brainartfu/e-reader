import { gql } from '@apollo/client';
import { initializeApollo } from "./apollo-client";

export async function getPostSlugPaths() {
  const apolloClient = initializeApollo();
  let posts = [];
  let after = '';
  let nextPage = false;
  do {
    const data = await apolloClient.query({
      query: gql`
        query WpmangasQuery ($first: Int, $after: String){
          wpmangas(where: {status: PUBLISH},first: $first, after: $after) {
            edges {
              node {
                id
                title
                slug
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
      `,
      variables: {
        first: 100,
        after
      }
    });
    after = data?.data.wpmangas.pageInfo.endCursor;
    nextPage = data?.data.wpmangas.pageInfo.hasNextPage;
    posts = posts.concat(data?.data.wpmangas.edges.map(({ node }) => node));
  } while (nextPage)

  return {
    paths: posts.map(({ slug }) => {
      return {
        params: {
          postSlug: slug
        }
      }
    }),
    fallback: true
  }
}