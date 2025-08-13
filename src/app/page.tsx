import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Logo />
            </div>
            <h1 className="text-3xl font-bold">Accès</h1>
            <p className="text-balance text-muted-foreground">
              Entrez vos identifiants pour accéder à votre espace
            </p>
          </div>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                type="text"
                placeholder="votrenom"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mot de passe</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline"
                >
                  Mot de passe oublié?
                </Link>
              </div>
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full" asChild>
              <Link href="/dashboard">Se connecter</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:flex items-center justify-center p-8">
        <Image
          src="/login-illustration.png"
          alt="Illustration"
          width="1280"
          height="1280"
          className="max-w-xl"
        />
      </div>
    </div>
  );
}
