import { GraphQLClient, gql } from 'graphql-request'
import { compare } from 'compare-versions'
import shelljs from 'shelljs'
import chalk from 'chalk'
import { name, version } from '../package.json'

const THIS_PACKAGE_NAME = name
const CURRENT_VERSION = version
const DIST_BRANCH = `auto_upgrade_${name}`
const TEMP_DIR = '../temp'
const THIS_PACKAGE_NAME_WITH_VERSION = `${THIS_PACKAGE_NAME}@${CURRENT_VERSION}`

const client = new GraphQLClient('https://api.github.com/graphql', {
  headers: {
    Authorization: `Bearer ${process.env.ACCESS_TOKEN}`
  }
})

const logger = (message, color = 'yellow') => {
  console.log(chalk[color](message))
}

const checkDependency = () => {
  const isInstalled = shelljs.which('gh')

  if (!isInstalled) {
    logger('gh is not installed. Install it wiht brew', 'red')
    logger('brew install gh', 'red')
    shelljs.exit(1)
  }
}

const getAllRepos = async () => {
  checkDependency()

  const query = gql`
    query {
      repositoryOwner(login: "${process.env.OWNER}") {
        repositories(isFork: false, isLocked: false, first: 100) {
          nodes {
            name
            isEmpty
            isMirror
            isArchived
            defaultBranchRef {
              id
              name
            }
          }
        }
      }
    }
    `

  const { repositoryOwner } = await client.request(query)

  return filterRepost(repositoryOwner.repositories.nodes)
}

const filterRepost = nodes => nodes.filter(node => !node.isEmpty || !node.isMirror || !node.isArchived).map(({ name }) => ({ name }))

const packagesOfRepo = content => {
  const { dependencies, devDependencies } = JSON.parse(content)

  return [
    ...Object.entries(dependencies || {}),
    ...Object.entries(devDependencies || {})
  ]
}

const getContent = async ({ name }) => {
  const query = gql`
    query($name: String!) {
      repository(owner: "${process.env.OWNER}", name: $name) {
        object(expression: "HEAD:") {
          ... on Tree {
            entries {
              name
              type
              path
              object {
                ... on Blob {
                  text
                }
              }
            }
          }
        }
      }
    }
  `

  const { repository } = await client.request(query, { name })

  if ((!repository && !repository.object)) {
    return
  }

  const file = repository?.object?.entries
    .find(({ path }) => path === 'package.json')

  if (!file) {
    return
  }

  const { object } = file
  const allPackages = packagesOfRepo(object.text)

  const [p] = allPackages.filter(entry => entry[0] === THIS_PACKAGE_NAME)
  if (!p) {
    return
  }

  const [n, v] = p
  const version = `${v}`.replace('^', '')
  if (!n.includes(THIS_PACKAGE_NAME)) {
    return
  }

  if (compare(version, CURRENT_VERSION, '>')) {
    return logger(`⏭️  ${name} is up to date`, 'green')
  }

  shelljs.rm('-rf', `${TEMP_DIR}_${name}`)

  logger('----------------', 'cyan')
  logger(`Processing ${name}`, 'cyan')
  logger('----------------', 'cyan')

  logger('🍴  Cloning repo')

  shelljs.exec(`gh repo clone paralenz/${name} ${TEMP_DIR}_${name}`)
  shelljs.cd(`${TEMP_DIR}_${name}`)
  logger(`Creating new branch ${DIST_BRANCH}`)
  shelljs.exec(`git checkout -b ${DIST_BRANCH}`)

  logger(`🍴  Upgrading to ${THIS_PACKAGE_NAME_WITH_VERSION}`)
  shelljs.exec(`yarn upgrade ${THIS_PACKAGE_NAME_WITH_VERSION}`)

  logger('🔐  Comitting changes')
  shelljs.exec('git add .')
  shelljs.exec(`git commit -m "⬆️ Auto upgrade ${THIS_PACKAGE_NAME} to ${CURRENT_VERSION}"`)

  logger('🙇  Pushing changes to origin')
  shelljs.exec(`git push -u origin ${DIST_BRANCH}`)

  logger('🚃  Creating pull request')
  shelljs.exec(`gh pr create -t "⬆️ Auto upgrade ${THIS_PACKAGE_NAME} to ${CURRENT_VERSION}" -b "⬆️ ${THIS_PACKAGE_NAME} has been upgraded to ${CURRENT_VERSION}" -a @me`)

  logger('🛑  Deleting temp folder')
  shelljs.cd('..')
  shelljs.rm('-rf', `${TEMP_DIR}_${name}`)

  return logger(`✅  Pull request created on ${name}`)
}

getAllRepos()
  .then(repos => repos.map(getContent))
  .catch(e => {
    console.log(e)
    shelljs.exit(1)
  })
// getAllRepos().then(repos => console.log(repos))
