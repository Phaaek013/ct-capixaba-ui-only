/*
This is a helper script file to describe the moves needed to reorganize the route groups
from src/app/(aluno), (coach), (auth), and page.tsx into src/app/(app-shell)/

This file is not part of the app runtime, just a note for the user.

Moves:
- Move src/app/(aluno) → src/app/(app-shell)/(aluno)
- Move src/app/(coach) → src/app/(app-shell)/(coach)
- Move src/app/(auth) → src/app/(app-shell)/(auth)
- Move src/app/page.tsx → src/app/(app-shell)/page.tsx

The (public) group remains directly under src/app unchanged.

This preserves URLs but changes layout hierarchy so that (app-shell) layout applies to all these routes.
*/
