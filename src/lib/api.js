import { initializeApollo } from 'lib/apollo-client';
import { gql } from '@apollo/client';

import { v4 as uuidv4 } from 'uuid';

const uuid = uuidv4();

const api = {
  bookmark: {
    isBookmarked: (postId, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.query({
        query: gql`
          query BookmarkQuery ($id: ID!) {
            wpmanga(id: $id) {
              isBookmark
            }
          }
        `,
        variables: {
          id: postId
        }
      });
    },
    set: (postId, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation setBookmark($postId: ID!, $chapter: String!, $uuid: String!, $page: Int!) {
            userBookmark(
              input: {
                post_id: $postId,
                chapter: $chapter,
                clientMutationId: $uuid,
                page: $page
              }
            ) {
              status
            }
          }
        `,
        variables: {
          postId: postId,
          chapter: "",
          page: 0,
          uuid: uuid,
        }
      });
    },
    remove: (postId, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation deleteBookmark($postId: ID!, $isMangaSingle: Boolean!, $uuid: String!) {
            deleteBookmark(
              input: {
                clientMutationId: $uuid,
                is_manga_single: $isMangaSingle,
                post_id: $postId,
              }
            ) {
              status
            }
          }
        `,
        variables: {
          postId: postId,
          isMangaSingle: true,
          uuid: uuid,
        }
      });
    }
  },

  reading: {
    remove: (postId, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation RemoveMadaraUserHistory($postId: ID!, $uuid: String!) {
            removeMadaraUserHistory(input: {post_id: $postId, clientMutationId: $uuid}) 
            {
              message
              status
            }
          }
        `,
        variables: {
          postId: postId,
          uuid: uuid,
        }
      });
    }
  },

  report: {
    getItems: () => {
      const apolloClient = initializeApollo();
      return apolloClient.query({
        query: gql`
          query ReportSettingItems {
            reportSettingItems
          }
        `
      });
    },
    save: (postSlug, chapterSlug, content, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation CreateReport ($postSlug: String!, $chapterSlug: String!, $content: String!, $uuid: String!) {
            createChapterReport( input: {
              commentOn: $postSlug,
              chapterSlug: $chapterSlug,
              content: $content,          
              clientMutationId: $uuid,
            } ) {
              status
              message
            }
          }
        `,
        variables: {
          postSlug: postSlug,
          chapterSlug: chapterSlug,
          content: content,
          uuid: uuid,
        }
      });
    }
  },

  topUp: {
    get: () => {
      const apolloClient = initializeApollo();
      return apolloClient.query({
        query: gql`
          query PointsConversions {
            pointsConversions
          }
        `
      });
    },
    purchase: (amount, points, transactionId, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation PurchasePoint($amount: Float!, $points: Int!, $transactionId: String!, $uuid: String!) {
            purchasePoint( input: {
              clientMutationId: $uuid,
              amount: $amount,
              points: $points,
              transaction_id: $transactionId,          
            } ) {
              status
              message
            }
          }
        `,
        variables: {
          amount,
          points: parseInt(points),
          transactionId,
          uuid
        }
      });
    },
    // getHistory: (userId, token) => {
    //   const apolloClient = initializeApollo(null, token, true);
    //   return apolloClient.query({
    //     query: gql`
    //       query GetPurchaseHistory ($id: ID!) {
    //         user(id: $id) {
    //           purchaseHistory
    //         }
    //       }
    //     `,
    //     variables: {
    //       id: userId
    //     }
    //   });
    // }
  },

  comment: {
    create: (postId, content, parentId) => {

    },
    delete: (id, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation DeleteComment($id: ID!, $uuid: String!) {
            deleteComment(
              input: {
                id: $id,
                clientMutationId: $uuid
              }
            ) {
              comment{
                id,
                parentDatabaseId
              }
              deletedId
            }
          }
        `,
        variables: {
          id: id,
          uuid: uuid,
        }
      });
    },
    get: (commentId, postSlug, chapterSlug) => {
      const apolloClient = initializeApollo();
      return apolloClient.query({
        query: gql`
          query GetComment ($id: [ID], $postSlug: ID!, $chapterSlug: String!) {
            comments(where: {commentIn: $id}) {
              nodes {
                id
                date
                content
                totalLikes
                currentUserLike
                commentId
                parentDatabaseId
                author {
                  node {
                    name
                    avatar {
                      url
                    }
                  }
                }
              }
            }
            wpmanga(id: $postSlug, idType: SLUG) {
              commentsCount(chapter_slug: $chapterSlug)
            }
          }
        `,
        variables: {
          id: commentId,
          postSlug,
          chapterSlug,
        }
      });
    }
  },

  chapterComment: {
    create: (postId, chapterSlug, content, parentId, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation CreateChapterComment($postId: ID!, $chapterSlug: String!, $content: String!, $parent: Int!, $uuid: String!) {
            createChapterComment (input: {
              clientMutationId: $uuid,
              chapterSlug: $chapterSlug,
              commentOn: $postId,
              content: $content,
              parent: $parent,
            }) {
              message
              status
              comment
            }
          }
        `,
        variables: {
          postId: postId,
          chapterSlug: chapterSlug,
          content: content,
          parent: parentId,
          uuid: uuid,
        }
      });
    }
  },

  user: {
    get: (userId, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.query({
        query: gql`
          query UserQuery ($userId: ID!) {
            user(id: $userId) {
              username
              userId
              firstName
              name 
              lastName
              avatar {
                url
              }
              remainingCoins
              remainingTickets
            } 
          }
        `,
        variables: {
          userId: userId
        }
      });
    },
    setPassword(userId, password, token) {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation UpdateUser($userId: ID!, $password: String!, $uuid: String!) {
            updateUser(input: {id: $userId, password: $password, clientMutationId: $uuid}) {
              clientMutationId
              user {
                email
                id
              }
            }
          }
        `,
        variables: {
          userId,
          password,
          uuid: uuid,
        }
      });
    }
  },

  site: {
    get: () => {
      const apolloClient = initializeApollo();
      return apolloClient.query({
        query: gql`
          query GetSiteInfo {
            generalSettings {
              title
              timezone
            }
          }
        `
      });
    },
  },

  chapter: {
    get: (postSlug, chapterSlug, order, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.query({
        query: gql`
          query ChapterQuery ($postSlug: ID!, $chapterSlug: String!, $order: String!){
            wpmanga(id: $postSlug, idType: SLUG) {
              mangaChapter(chapter_slug: $chapterSlug)
              mangaSingleNextNav(order: $order, chapter_slug: $chapterSlug)
              mangaSinglePrevNav(order: $order, chapter_slug: $chapterSlug)
            }
          }
        `,
        variables: {
          postSlug,
          chapterSlug,
          order
        }
      });
    },
    getChaptersByPost: (postSlug, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.query({
        query: gql`
        query GetChapterListByPostSlug ($slug: ID!) {
          wpmanga(id: $slug, idType: SLUG) {
            mangaChaptersList {
              coin
              id
              purchasable
              scope
              slug
              ticket
              title
              volume_id
            }
            mangaVolumeList {
              id
              index
              name
              date_gmt
            }
            databaseId
          } 
        }
      `,
        variables: {
          slug: postSlug
        }
      });
    }
  },

  announcement: {
    get: () => {
      const apolloClient = initializeApollo();
      return apolloClient.query({
        query: gql`
          query GetAnnouncements {
            announcements(where: {orderby: {field: DATE, order: DESC}}, first: 100) {
              nodes {
                id
                date
                databaseId
                title
                featuredImage {
                  node {
                    mediaItemUrl
                  }
                }
                announcementCategories {
                  nodes {
                    name
                    slug
                  }
                }
              }
            }
          }
        `
      });
    }
  },

  policy: {
    get: () => {
      const apolloClient = initializeApollo();
      return apolloClient.query({
        query: gql`
          query GetPrivacyPolicy {
            page(id: "privacy-policy", idType: URI) {
              id
              content
            }
          }
        `
      });
    }
  },

  rewards: {
    get: () => {
      const apolloClient = initializeApollo();
      return apolloClient.query({
        query: gql`
          query GetRewards {
            timeBasedRewards
          }
        `
      });
    },
    claim: (id, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation SendTipChapter($id:ID!, $uuid: String!) {
            timeBasedRewardsClaim(input: {timeBasedId: $id, clientMutationId: $uuid}) {
              message
              next_claim
              rewards
              status
            }
          }
        `,
        variables: {
          id,
          uuid: uuid,
        }
      });
    },
  },

  paypal: {
    getInfo: () => {
      const apolloClient = initializeApollo();
      return apolloClient.query({
        query: gql`
          query GetPaypalInfo {
            paypalSandbox
            paypalClientId
          }
        `
      });
    }
  },

  tip: {
    send: (mangaId, chapterSlug, tip, token) => {
      const apolloClient = initializeApollo(null, token, true);
      return apolloClient.mutate({
        mutation: gql`
          mutation SendTipChapter($mangaId:ID!, $chapterSlug: String!, $tip: Int!, $uuid: String!) {
            sendTipChapter(input: {manga_id:$mangaId, chapter_slug: $chapterSlug, clientMutationId: $uuid, tip: $tip}) {
              message
              status
            }
          }
        `,
        variables: {
          mangaId,
          chapterSlug: chapterSlug,
          tip: parseInt(tip),
          uuid: uuid,
        }
      });
    },
  }
}

export default api;