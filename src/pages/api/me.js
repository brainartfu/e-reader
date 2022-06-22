// import { getSession } from 'next-auth/client';
import { initializeApollo } from 'lib/apollo-client';
import { useSession } from 'next-auth/react';

export default async (req, res) => {
  const { data: session, status } = useSession();

  // const session = await getSession({ req });
  if (session) {
    try {
      const apolloClient = initializeApollo(null, session?.user.accessToken, true);  
      const data = await apolloClient.query({
        query: gql`
          {
            user(id: "${session.user.id}") {
              id
              username
              firstName
              email
              lastName
            }
          }
          `,
        });
      res.json({ success: 'ok', data: data.data.user });
    } catch (error) {
      const { response: fetchResponse } = error;
      res.status(fetchResponse?.status || 500).json(error.data);
    }
  } else {
    // Not Signed in
    res.status(401);
  }
  res.end();
};
