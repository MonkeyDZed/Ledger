
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
        <div 
            className="flex flex-col justify-center p-8 relative"
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
        >
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
