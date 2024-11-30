import type { Metadata } from "next";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import "./globals.css";
import {NextIntlClientProvider} from 'next-intl';
import {getLocale, getMessages} from 'next-intl/server';



export const metadata: Metadata = {
  title: "Veracity AI",
  description: "A fact checking machine.",
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body>
      <UserProvider>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </UserProvider>
      </body>
    </html>
  );
}
