# Misinformation Mitigation Project
## Frontend
This is a Next.js frontend for the Misinoformation Mitigation project. To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Quick Start
Assuming npm is already installed, the project set up is quick and easy.

1. Clone the repo
```bash
git clone https://github.com/ComplexData-MILA/veracity-eval-frontend.git
cd veracity-eval-frontend
```

2. Create a `.env` file in the root directory and add the necessary environment variables. Use a `.env.local` for local development:
```bash
AUTH0_SECRET=${auth0SecretHere}
AUTH0_BASE_URL='https://veri-fact.ai/' or 'localhost:3000/'
AUTH0_ISSUER_BASE_URL='https://veri-fact.ca.auth0.com/'
AUTH0_CLIENT_ID=${clientIdHere}
AUTH0_CLIENT_SECRET=${clientSecretHere}
AUTH0_AUDIENCE='https://veri-fact.ca.auth0.com/api/v2/'
AUTH0_SCOPE='openid profile email offline_access'
NEXT_PUBLIC_API_URL='https://api.veri-fact.ai'
```

3. Install dependencies
```bash
npm install
```

4. Run project
```bash
npm run dev
```

Project will now be running on localhost:3000/

## Dependencies
The frontend of the project uses typescript and sass throughout. Style modules are a mix of components and page level styling.

Internationalization is handled by [next-intl](https://www.npmjs.com/package/next-intl) and at the time of writing, we are increasing use of our charting dependency, [chart.js](https://www.chartjs.org/). Like most nextjs projects, linting is handled by eslint.

## Project Overview

 For more details on the project that are not specific to the frontend, please refer to the [Project Overview](https://github.com/ComplexData-MILA/veracity-eval-backend/wiki/Project-Overview) wiki page.

 For details relating to the Next.js project specifically there is wiki page [here](https://github.com/ComplexData-MILA/veracity-eval-frontend/wiki/Project-Overview)

## API Specification

For detailed API documentation, please refer to the [API Specification](https://github.com/ComplexData-MILA/veracity-eval-backend/wiki/API-Specification) wiki page, or to the [Swagger Docs](https://api.veri-fact.ai/docs).

