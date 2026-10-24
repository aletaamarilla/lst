import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'q5bj2rn2',
    dataset: 'production',
  },
  deployment: {
    appId: 'jcegzkyow71llyc9jting9xd',
    autoUpdates: true,
  },
})
