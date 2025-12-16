#!/bin/bash

# Script pour corriger l'erreur Next.js 15 params async dans tous les fichiers

FILES=(
  "src/app/[lang]/(app)/pieces/page.tsx"
  "src/app/[lang]/(app)/reports/page.tsx"
  "src/app/[lang]/(app)/settings/page.tsx"
  "src/app/[lang]/(app)/suppliers/page.tsx"
  "src/app/[lang]/(app)/suppliers/[id]/page.tsx"
  "src/app/[lang]/page.tsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."

    # Remplacer params: { lang: Locale } par params: Promise<{ lang: Locale }>
    sed -i 's/params: { lang: Locale }/params: Promise<{ lang: Locale }>/g' "$file"

    # Remplacer params: { lang: Locale, id: string } par params: Promise<{ lang: Locale, id: string }>
    sed -i 's/params: { lang: Locale, id: string }/params: Promise<{ lang: Locale, id: string }>/g' "$file"

    # Remplacer const { lang } = params; par const { lang } = await params;
    sed -i 's/const { lang } = params;/const { lang } = await params;/g' "$file"

    # Remplacer const { lang, id } = params; par const { lang, id } = await params;
    sed -i 's/const { lang, id } = params;/const { lang, id } = await params;/g' "$file"

    echo "✓ Fixed $file"
  else
    echo "⚠ File not found: $file"
  fi
done

echo ""
echo "✅ All params fixed! Now fixing database..."
