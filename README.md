This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker & Dokploy Deployment

This project includes a production-ready Docker configuration compatible with Dokploy and other container platforms.

### Running Locally with Docker Compose

The easiest way to run the project locally is with Docker Compose:

```bash
docker-compose up -d --build
```

This will build the image and start the container on port 3000. Open [http://localhost:3000](http://localhost:3000) to view it.

### Running with Docker CLI

1. **Build the image:**

```bash
docker build -t nextjs-app .
```

2. **Run the container:**

```bash
docker run -p 3000:3000 nextjs-app
```

### Deploying to Dokploy

This project is pre-configured for Dokploy:

1. Create a new "Application" in your Dokploy dashboard.
2. Connect your Git repository.
3. Select the branch you want to deploy (e.g., `main`).
4. **Build Type:** Select `Dockerfile`.
5. **Environment Variables:** Add any necessary environment variables (e.g., `OPENAI_API_KEY`) in the "Environment" tab.
6. Click **Deploy**.

The `Dockerfile` is optimized for production using a multi-stage build to keep the image size small and secure. It exposes port `3000` by default.