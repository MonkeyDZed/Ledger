

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gray-100 p-4">
      <Card className="grid w-full max-w-4xl grid-cols-1 overflow-hidden shadow-2xl md:grid-cols-2">
        <div className="relative items-center justify-center bg-primary p-8 hidden md:flex overflow-hidden">
           <img
            src="/login-illustration.png"
            alt="Illustration"
            className="h-full w-full object-cover transition-transform duration-500 ease-in-out hover:scale-110 scale-125"
          />
        </div>
        <div className="flex flex-col justify-center p-8" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 40' width='80' height='40'%3e%3cpath fill='hsl(var(--primary))' fill-opacity='0.1' d='M0 40V0h80v40H0zM20 20c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10zm40 0c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10-10-4.477-10-10z'%3e%3c/path%3e%3c/svg%3e\")", maskImage: "linear-gradient(to left, #000, transparent)"}}>
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-2 mb-4">
                  <Logo />
              </div>
              <CardTitle className="text-3xl font-bold">Accès</CardTitle>
              <CardDescription className="text-balance text-muted-foreground">
                Entrez vos identifiants pour accéder à votre espace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="votrenom"
                    required
                    defaultValue=""
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link
                      href="#"
                      className="ml-auto inline-block text-sm underline"
                    >
                      Mot de passe oublié?
                    </Link>
                  </div>
                  <Input id="password" type="password" required defaultValue=""/>
                </div>
                <Button type="submit" className="w-full" asChild>
                  <Link href="/dashboard">Se connecter</Link>
                </Button>
              </div>
            </CardContent>
        </div>
      </Card>
    </div>
  );
}
