![Emmanuel Béziat Logo](https://rest.emmanuelbeziat.com/public/favicons/favicon-96x96.png)

# emmanuelbeziat-rss :: Emmanuel Béziat

📰 RSS file creation on push hooks? Yeah!

![Built with](https://img.shields.io/badge/built_with-nodejs-blue.svg?style=flat) ![Built With](https://img.shields.io/badge/built_with-nunjucks-green.svg?style=flat
)

## What?

- Fetch markdown files, parse it to build a RSS file
- Environment configuration using dotenv

## Installation

```bash
# Get the repo
git clone git+ssh://git@github.com/EmmanuelBeziat/emmanuelbeziat-rss.git

# Navigate into project folder
cd emmanuelbeziat-rss

# Intall dependencies
npm i
```


## .env file example

```env
POSTS="<folder path>"
SITE="<url>"
OUTPUT="<folder path>"
```
## Usage

- **CLI**
  ```bash
  npm start # same as: rss-build
  rss-build --posts ./posts --site https://example.com --output ./output --file-name blog.xml --limit 20
  ```
  Build the RSS file. Can be triggered from a webhook.

- **Programmatic API**
  ```ts
  import { buildRss } from 'emmanuelbeziat-rss'

  await buildRss({
    postsDir: './posts',
    outputDir: './output',
    fileName: 'blog.xml',
    limit: 20
  })
  ```

## License

This project is licensed under the MIT License.
