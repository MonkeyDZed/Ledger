
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
        <div
            className="flex flex-col justify-center p-8 relative"
            style={{
                backgroundImage: `linear-gradient(to left, hsla(220, 13%, 96%, 0.3), hsla(220, 13%, 96%, 1)), url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
        >
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
