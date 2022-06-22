import { useMemo } from 'react';
import { ApolloClient, HttpLink, InMemoryCache, ApolloLink, concat } from '@apollo/client';
import merge from 'deepmerge';
import isEqual from 'lodash/isEqual';

export const APOLLO_STATE_PROP_NAME = '__APOLLO_STATE__'
let apolloClient;

const authMiddleware = authToken => {
    return new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: authToken ? `Bearer ${authToken}` : null,
      }
    }));

    return forward(operation);
  })
}
const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_WORDPRESS_GRAPHQL_ENDPOINT,
});


export function initializeApollo(initialState = null, authToken = null, refresh = false) {
  if (refresh) apolloClient = undefined;
  const _apolloClient = apolloClient ?? _createApolloClient(authToken)

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = _apolloClient.extract()

    // Merge the initialState from getStaticProps/getServerSideProps in the existing cache
    const data = merge(existingCache, initialState, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    })

    // Restore the cache with the merged data
    _apolloClient.cache.restore(data)
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === 'undefined') return _apolloClient
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = _apolloClient

  return _apolloClient
}
/**
 * createApolloClient
 */

export function _createApolloClient(authToken) {
  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    link: concat(authMiddleware(authToken), httpLink),
    cache: new InMemoryCache(),
  });
}

export function addApolloState(client, pageProps) {
  if (pageProps?.props) {
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract()
  }

  return pageProps
}

export function useApollo(pageProps, authToken) {
  const state = pageProps[APOLLO_STATE_PROP_NAME]
  const store = useMemo(() => initializeApollo(state, authToken), [state])
  return store
}