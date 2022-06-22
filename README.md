# nextjs E-reader
## Need to add nextjs starter on your local
```bash
yarn create next-app -e https://github.com/colbyfayock/next-wpgraphql-basic-starter
# or
npx create-next-app -e https://github.com/colbyfayock/next-wpgraphql-basic-starter
```

Add an `.env.local` file to the root with the following:
```
WORDPRESS_GRAPHQL_ENDPOINT="http://18.180.40.42/project-seed/graphql"
```