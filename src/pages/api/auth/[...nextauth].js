/* eslint-disable no-console*/
import NextAuth from 'next-auth';
import { gql } from '@apollo/client';
import { initializeApollo } from 'lib/apollo-client';
import { v4 as uuidv4 } from 'uuid';
import CredentialsProvider from "next-auth/providers/credentials"
import jwt_decode from "jwt-decode";

const uuid = uuidv4();
async function refreshAccessToken(token) {
  const apolloClient = initializeApollo();
  try {
    const response = await apolloClient.mutate({
      mutation: gql`
        mutation RefreshAuthToken {
          refreshJwtAuthToken(
            input: {
              clientMutationId: "${uuid}"
              jwtRefreshToken: "${token.refreshToken}",
          }) {
            authToken
          }
        }  
      `,
    })
    if (!response.data) {
      throw response;
    }

    return {
      ...token,
      accessToken: response?.data?.refreshJwtAuthToken.authToken,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError'
    };
  }
}

const providers = [
  CredentialsProvider({
    id: 'login',
    name: 'Credentials',
    credentials: {
      email: {
        label: 'email',
        type: 'email',
        placeholder: 'jsmith@example.com',
      },
      password: { label: 'Password', type: 'password' },
    },
    authorize: async credentials => {
      const apolloClient = initializeApollo();
      try {
        const data = await apolloClient.mutate({
          mutation: gql`
            mutation LoginUser {
              login( input: {clientMutationId:"${uuid}",
                username: "${credentials.email}",
                password: "${credentials.password}"
              } ) {
                authToken
                refreshToken
                user {
                  id
                  name
                  currentBookmarks {
                    book {
                      id
                      slug
                    }
                    page
                    unread_chapters
                  }
                  avatar {
                    url
                  }
                }
              }
            }  
          `,
        })
        return {
          status: 'success',
          data: {
            authToken: data.data.login.authToken,
            refreshToken: data.data.login.refreshToken
          },
          user: data?.data?.login?.user
        };
      } catch (error) {
        const errorMessage = error.response.data.message;
        // Redirecting to the login page with error messsage in the URL
        throw new Error(errorMessage + '&email=' + credentials.email);
      }
    },
    pages: {
      signIn: '/auth/login',
    },
  }),
  CredentialsProvider({
    id: 'register',
    name: 'Signup Credentials',
    authorize: async credentials => {
      const apolloClient = initializeApollo();
      try {
        const { data } = await apolloClient.mutate({
          mutation: gql`
            mutation RegisterUser {
              registerUser( input: {clientMutationId:"${uuid}",
                email: "${credentials.email}",
                username: "${credentials.name}",
                password: "${credentials.password}",
                yim: "${credentials.referralcode}"
              } ) {
                user {
                  id
                  name
                  jwtAuthToken
                  jwtRefreshToken
                }
              }
            }  
          `,
        })
        return {
          status: 'success',
          data: {
            authToken: data.registerUser.user.jwtAuthToken,
            refreshToken: data.registerUser.user.jwtRefreshToken
          },
          user: {
            id: data.registerUser.user.id
          }
        };
      } catch (error) {
        const errorMessage = error.graphQLErrors[0].message;
        // Redirecting to the login page with error messsage in the URL
        throw new Error(JSON.stringify(errorMessage));
      }
    }
  })
];

const callbacks = {
  async jwt({ token, user, account }) {
    if (account && user) {
      return {
        ...token,
        accessToken: user?.data.authToken,
        refreshToken: user?.data.refreshToken,
        id: user?.user.id
      };
    }
    if (token?.accessToken) {
      const authToken = jwt_decode(token?.accessToken)
      if (Date.now() < (authToken.exp - 10) * 1000) return token;
      const newToken = await refreshAccessToken(token);
      return newToken;
    }
    return token
  },

  async session({ session, token }) {
    if (token) {
      session.user.accessToken = token.accessToken;
      session.user.id = token.id;
    }
    return session;
  }
};

const options = {
  providers,
  callbacks,
  pages: {
    signIn: 'auth/login',
    error: '/auth/login' // Changing the error redirect page to our custom login page
  }
};

export default (req, res) => NextAuth(req, res, options);
