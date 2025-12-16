#!/bin/bash

echo "🔧 Fixing all params.lang occurrences in Server Components..."

# Fix Server Components (page.tsx files)
echo ""
echo "📄 Fixing Server Components (page.tsx)..."

# suppliers/[id]/page.tsx
FILE="src/app/[lang]/(app)/suppliers/[id]/page.tsx"
if [ -f "$FILE" ]; then
  sed -i 's/const dictionary = await getDictionary(params\.lang);/const { lang, id } = await params;\n  const dictionary = await getDictionary(lang);/g' "$FILE"
  echo "✓ Fixed $FILE"
fi

# settings/page.tsx
FILE="src/app/[lang]/(app)/settings/page.tsx"
if [ -f "$FILE" ]; then
  sed -i 's/const dictionary = await getDictionary(params\.lang);/const { lang } = await params;\n    const dictionary = await getDictionary(lang);/g' "$FILE"
  echo "✓ Fixed $FILE"
fi

# layout.tsx (app layout - needs special handling as it's already async)
FILE="src/app/[lang]/(app)/layout.tsx"
if [ -f "$FILE" ]; then
  echo "⚠️  $FILE needs manual review (complex component with many params.lang references)"
fi

echo ""
echo "✅ Server Components fixed!"
echo ""
echo "ℹ️  Note: Client Components use 'params' directly (passed as props)"
echo "   They don't need 'await params' as they receive data from Server Components."
