Workflows exists to automate common tasks such as testing, building, and deploying the project.

Testing:

1. For every pull request or change, should be tested by basic **jest tests**
2. After every pull request to 'dev' branch, should be run **e2e tests** on deployed version

Deployment:

1. On every push to 'dev' branch, should be deployed
2. On every push to 'main' branch, should be deployed to production
   - main (shared db)
     - chvalotce.cz
     - worship.cz
   - non-czech (different db)
     hallelujahhub.com
