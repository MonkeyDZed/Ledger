

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import Link from 'next/link';
import React from 'react';

export default function LoginPage({ params: paramsProp }: { params: { lang: Locale } }) {
  const { lang } = React.use(paramsProp);
  const dict = React.use(getDictionary(lang));
  const { loginPage } = dict;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <Card className="grid w-full max-w-4xl grid-cols-1 overflow-hidden shadow-2xl md:grid-cols-2">
        <div className="relative items-center justify-center bg-primary p-8 hidden md:flex overflow-hidden">
           <img
            src="/login-illustration.png"
            alt={loginPage.illustrationAlt}
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out hover:scale-110 scale-125"
          />
        </div>
        <div 
          className="flex flex-col justify-center p-8"
          style={{
            backgroundColor: '#ffffff',
            backgroundImage: `
              linear-gradient(to right, #dbeafe 1px, transparent 1px),
              linear-gradient(to bottom, #dbeafe 1px, transparent 1px)
            `,
            backgroundSize: '2rem 2rem',
          }}
        >
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-4">
                  <Logo />
              </div>
              <CardDescription className="text-balance text-muted-foreground">
                {loginPage.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">{loginPage.usernameLabel}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={loginPage.usernamePlaceholder}
                    required
                    defaultValue=""
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">{loginPage.passwordLabel}</Label>
                    <Link
                      href="#"
                      className="ms-auto inline-block text-sm underline"
                    >
                      {loginPage.forgotPasswordLink}
                    </Link>
                  </div>
                  <Input id="password" type="password" required defaultValue=""/>
                </div>
                <Button type="submit" className="w-full" asChild>
                  <Link href={`/${lang}/dashboard`}>{loginPage.loginButton}</Link>
                </Button>
              </div>
            </CardContent>
        </div>
      </Card>
    </div>
  );
}
