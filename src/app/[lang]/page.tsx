

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDictionary } from '@/lib/dictionaries';
import { Locale } from '@/i18n.config';
import Link from 'next/link';

export default async function LoginPage({ params: { lang } }: { params: { lang: Locale } }) {
  const dict = await getDictionary(lang);
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
        <div className="flex flex-col justify-center p-8" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3e%3cpath fill='hsl(var(--primary))' fill-opacity='0.1' d='M0 40V0h80v40H0zM20 20c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm40 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'%3e%3c/path%3e%3c/svg%3e\")", maskImage: "linear-gradient(to left, #000, transparent)"}}>
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-4">
                  <Logo />
              </div>
              <CardTitle className="text-3xl font-bold">{loginPage.title}</CardTitle>
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
                      className="ml-auto inline-block text-sm underline"
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
