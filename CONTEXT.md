# Slotty API — stan prac

Branch: `develop`. NestJS + CQRS + DDD + MikroORM. Alias: `@packages/*` już w `tsconfig`.

## Konwencje

- Props agregatów: zwykłe typy (`string`, `number`, `Date`, enum) — VO powstają w konstruktorze.
- Persistence mapper mapuje pola jawnie (bez spreadu encji).
- Read-model mapper mapuje snapshot jawnie, bez `deletedAt`, `@Injectable()`.
- Soft delete + `includingDeleted` przy unikalnych parach (np. user+day).
- Nie commituj `graphify-out/` ani `bruno/environments/`.

## Zrobione (pełny slice: domain → HTTP → migracja → Bruno)

| Moduł | Co |
|---|---|
| **Users / profiles / integrations** | konto, profil, OAuth, tokeny |
| **Users working hours** | `GET/PUT /users/me/working-hours`, `PATCH .../:dayOfWeek` (1=Pn … 7=Nd) |
| **Customers** | CRM |
| **Events** | kalendarz, statusy, overlap |
| **Messages** | inbox, wątek, create, tools, soft-delete |
| **Broadcasts** | draft → send, recipient statuses, restore |
| **Packages** | szablony oferty + zakupione pakiety klienta (sesje, płatność, expire/cancel/extend) |

Migracje: `…53802` users, `…63420` customers, `…184500` integrations, `…210000` events, `…110000` messages, `…120000` working hours, `…130000` broadcasts, `…140000` packages.

Po pullu: `npm run migration:up`.

## Dev seeder

`npm run seed:dev` zapełnia jedno konto trenera (domyślnie `004486ad-…3a64`) pełnym zestawem danych: profil, godziny pracy, 4 integracje, 48 klientów, 6 szablonów pakietów, ~40 pakietów klientów, ~1400 wydarzeń (7 mies. wstecz → 2 mies. w przód, bez nakładek), ~800 wiadomości w wątkach i 8 ogłoszeń z odbiorcami.

Flagi: `--user=<uuid> --customers=60 --months-back=9 --months-forward=3 --seed=7 --keep`. Ten sam `--seed` daje identyczne dane. Domyślnie kasuje poprzednie dane TEGO usera (`--keep` dopisuje). Odmawia startu przy `NODE_ENV=production`.

## Packages

Agregaty:

- `PackageTemplate` — oferta trenera (name, sessionCount, price w groszach, currency, validityDays, isActive)
- `CustomerPackage` — zakupiony snapshot (total/remaining sessions, isPaid, expiresAt)

Status: `ACTIVE` ↔ `DEPLETED` → `EXPIRED` / `CANCELLED`. `EXPIRED` może wrócić do `ACTIVE` przy `extend`. `consumeSession` / `restoreSession` / `markPaid` / `cancel`.

HTTP (JWT):

- Szablony: `GET/POST /packages/templates`, `GET/PATCH /packages/templates/:id`, `POST .../activate|deactivate|restore`, `DELETE`
- Pakiety: `GET/POST /packages`, `GET /packages/customers/:customerId`, `GET /packages/:id`
- Akcje: `POST .../consume|restore-session|pay|unpay|expire|cancel|restore`, `PATCH .../extend`, `DELETE`

Przypisanie pakietu: `packageTemplateId` (aktywny szablon, snapshot + `expiresAt` z `validityDays`) albo ręczne `name` + `totalSessions` + `pricePaid`.
