Read AGENTS.md first and follow it strictly.

Study the existing auth screens and current mocked auth flow, then replace the mock behavior with real JavaScript Native Sign in Clerk authentication by following the Clerk documentation provided below. 

Keep the existing UI and navigation flow intact. Implement email-based Sign Up, Sign In, social auth where supported, and verification code handling through Clerk. 

After successful verification/authentication, navigate to the home route (/). If not authenticated, show onboarding route (/onboarding(. If authenticated, show home route (/). 

Do not change the screen design. If there is any need, ask me before implementation

---

# Next.js Quickstart (Pages Router)

**Example Repository**

- [Next.js Pages Router Quickstart Repo](https://github.com/clerk/clerk-nextjs-pages-quickstart)

**Before you start**

- [Set up a Clerk application](https://clerk.com/docs/getting-started/quickstart/setup-clerk.md)

1. ## Create a new Next.js app

   If you don't already have a Next.js app (Pages Router), run the following commands to [create a new one](https://nextjs.org/docs/pages/getting-started/installation).

   ```npm
   npm create next-app@latest clerk-nextjs-pages -- --no-app
   cd clerk-nextjs-pages
   npm install
   ```
2. ## Install `@clerk/nextjs`

   The [`Clerk Next.js SDK`](https://clerk.com/docs/reference/nextjs/overview.md) gives you access to prebuilt components, hooks, and helpers to make user authentication easier.

   Run the following command to install the SDK:

   ```npm
   npm install @clerk/nextjs
   ```
3. ## Set your Clerk API keys

   Add the following keys to your `.env` file. These keys can always be retrieved from the [**API keys**](https://dashboard.clerk.com/~/api-keys) page in the Clerk Dashboard.

   1. In the Clerk Dashboard, navigate to the [**API keys**](https://dashboard.clerk.com/~/api-keys) page.
   2. In the **Quick Copy** section, copy your Clerk Publishable Key and Secret Key.
   3. Paste your keys into your `.env` file.

   The final result should resemble the following:

   ```env {{ filename: '.env' }}
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY={{pub_key}}
   CLERK_SECRET_KEY={{secret}}
   ```
4. ## Add `clerkMiddleware()` to your app

   [`clerkMiddleware()`](https://clerk.com/docs/reference/nextjs/clerk-middleware.md) grants you access to user authentication state throughout your app. It also allows you to protect specific routes from unauthenticated users. To add `clerkMiddleware()` to your app, follow these steps:

   > If you're using Next.js ≤15, name your file `middleware.ts` instead of `proxy.ts`. The code itself remains the same; only the filename changes.

   1. Create a `proxy.ts` file.
      - If you're using the `/src` directory, create `proxy.ts` in the `/src` directory.
      - If you're not using the `/src` directory, create `proxy.ts` in the root directory alongside `.env`.
   2. In your `proxy.ts` file, export the `clerkMiddleware()` helper:

      ```tsx {{ filename: 'proxy.ts' }}
      import { clerkMiddleware } from '@clerk/nextjs/server'

      export default clerkMiddleware()

      export const config = {
        matcher: [
          // Skip Next.js internals and all static files, unless found in search params
          '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
          // Always run for API routes
          '/(api|trpc)(.*)',
          // Always run for Clerk-specific frontend API routes
          '/__clerk/(.*)',
        ],
      }
      ```
   3. By default, `clerkMiddleware()` will not protect any routes. All routes are public and you must opt-in to protection for routes. See the [`clerkMiddleware() reference`](https://clerk.com/docs/reference/nextjs/clerk-middleware.md) to learn how to require authentication for specific routes.
5. ## Add `<ClerkProvider>` and Clerk components to your app

   The [`<ClerkProvider>`](https://clerk.com/docs/nextjs/reference/components/clerk-provider.md) component provides session and user context to Clerk's hooks and components. It's recommended to wrap your entire app at the entry point with `<ClerkProvider>` to make authentication globally accessible. See the [`reference docs`](https://clerk.com/docs/nextjs/reference/components/clerk-provider.md) for other configuration options.

   Copy and paste the following code into your app. This:

   - Adds the `<ClerkProvider>` to your app, providing Clerk's authentication context to your app.
   - Creates a header with Clerk's [`prebuilt components`](https://clerk.com/docs/nextjs/reference/components/overview.md) to allow users to sign in and out, and display different content for signed-in and signed-out users.

   ```tsx {{ filename: 'pages/_app.tsx', mark: [2, [7, 27]] }}
   import '@/styles/globals.css'
   import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from '@clerk/nextjs'
   import type { AppProps } from 'next/app'

   function MyApp({ Component, pageProps }: AppProps) {
     return (
       <ClerkProvider
         {...pageProps}
         appearance={{
           cssLayerName: 'clerk',
         }}
       >
         <header className="flex justify-end items-center p-4 gap-4 h-16">
           <Show when="signed-out">
             <SignInButton />
             <SignUpButton>
               <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                 Sign Up
               </button>
             </SignUpButton>
           </Show>
           <Show when="signed-in">
             <UserButton />
           </Show>
         </header>
         <Component {...pageProps} />
       </ClerkProvider>
     )
   }

   export default MyApp
   ```

   This example uses the following components:

   - [`<Show when="signed-in">`](https://clerk.com/docs/nextjs/reference/components/control/show.md): Children of this component can only be seen while **signed in**.
   - [`<Show when="signed-out">`](https://clerk.com/docs/nextjs/reference/components/control/show.md): Children of this component can only be seen while **signed out**.
   - [`<UserButton />`](https://clerk.com/docs/nextjs/reference/components/user/user-button.md): Shows the signed-in user's avatar. Selecting it opens a dropdown menu with account management options.
   - [`<SignInButton />`](https://clerk.com/docs/nextjs/reference/components/unstyled/sign-in-button.md): An unstyled component that links to the sign-in page. In this example, since no props or [environment variables](https://clerk.com/docs/guides/development/clerk-environment-variables.md) are set for the sign-in URL, this component links to the [Account Portal sign-in page](https://clerk.com/docs/guides/account-portal/overview.md#sign-in).
   - [`<SignUpButton />`](https://clerk.com/docs/nextjs/reference/components/unstyled/sign-up-button.md): An unstyled component that links to the sign-up page. In this example, since no props or [environment variables](https://clerk.com/docs/guides/development/clerk-environment-variables.md) are set for the sign-up URL, this component links to the [Account Portal sign-up page](https://clerk.com/docs/guides/account-portal/overview.md#sign-up).
6. ## Update `globals.css`

   In the previous step, the `cssLayerName` property is set on the `<ClerkProvider>` component. Now, you need to **add the following line to the top of your `globals.css` file** in order to include the layer you named in the `cssLayerName` property. The example names the layer `clerk` but you can name it anything you want. These steps are necessary for v4 of Tailwind as it ensures that Tailwind's utility styles are applied after Clerk's styles.

   ```css {{ filename: 'globals.css' }}
   + @layer theme, base, clerk, components, utilities;
     @import 'tailwindcss';
   ```
7. ## Run your project

   Run your project with the following command:

   ```npm
   npm run dev
   ```
8. ## Create your first user

   1. Visit your app's homepage at [http://localhost:3000](http://localhost:3000).
   2. Select "Sign up" on the page and authenticate to create your first user.

## Next steps

Learn more about Clerk components, how to build custom authentication flows, and how to use Clerk's client-side helpers using the following guides.

- [Prebuilt components](https://clerk.com/docs/reference/components/overview.md): Learn how to quickly add authentication to your app using Clerk's suite of components.
- [Create a custom sign-in-or-up page](https://clerk.com/docs/nextjs/guides/development/custom-sign-in-or-up-page.md): Learn how to create a custom sign-in-or-up page with Clerk components.
- [Protect content and read user data](https://clerk.com/docs/nextjs/guides/users/reading.md): Learn how to use Clerk's hooks and helpers to protect content and read user data in your Next.js app.
- [Get started with Organizations](https://clerk.com/docs/nextjs/guides/organizations/getting-started.md): Learn how to create and manage Organizations in your Next.js app.
