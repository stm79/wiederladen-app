# Wiederladen

Persönliches Werkzeug zur Verwaltung von Wiederlade-Daten: Ladedaten, Schussgruppen-Fotos mit
automatischer Vermessung, Chronograph-Import (LabRadar, Garmin Xero, MagnetoSpeed, generisches
CSV/Excel), grafische Auswertung, Vergleichsansicht sowie CSV-/PDF-Export.

## Erste Einrichtung (Docker)

1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) installieren und starten.
2. In diesem Ordner (`wiederladen-app`) ausführen:

   ```
   docker compose up --build
   ```

   Der erste Start baut das Image und richtet die Datenbank automatisch ein (Migrationen laufen
   beim Container-Start). Das dauert beim ersten Mal ein paar Minuten.

3. App öffnen: [http://localhost:3000](http://localhost:3000)

4. Vom Handy im selben WLAN erreichbar unter `http://<IP-des-PCs>:3000` (IP z.B. per
   `ipconfig` unter "IPv4-Adresse" nachsehen). Falls das nicht funktioniert, muss in der
   Windows-Firewall eingehender TCP-Verkehr auf Port 3000 für private Netzwerke erlaubt werden
   (Windows-Sicherheit → Firewall → Erweiterte Einstellungen → Eingehende Regeln → Neue Regel →
   Port 3000/TCP zulassen).

Zum Stoppen: `Strg+C`, danach `docker compose down`. Erneuter Start: `docker compose up`
(ohne `--build`, außer der Code hat sich geändert).

## Daten & Backup

Alle Daten liegen außerhalb des Containers auf der Festplatte und überleben Neustarts/Rebuilds:

- `data/db/wiederladen.db` — die SQLite-Datenbank
- `data/uploads/` — hochgeladene Schussgruppen-Fotos

Ein vollständiges Backup lässt sich jederzeit über **Einstellungen** erzeugen: **Datenbank-Backup
herunterladen** + **Alle Bilder herunterladen (ZIP)** zusammen. Für ein vollständiges Backup genügt
es aber auch, den gesamten `data`-Ordner zu kopieren. Über **Backup wiederherstellen** lässt sich
eine heruntergeladene Datenbank-Backup-Datei auch wieder einspielen (legt vorher automatisch eine
Sicherheitskopie der aktuellen Datenbank an; die App startet danach kurz neu).

## Produktions-Deployment (Linux-Server + Reverse Proxy)

Für einen Linux-Server, der über einen Reverse Proxy (der selbst als Docker-Container läuft, z.B.
Traefik/Caddy/nginx-proxy) aus dem Internet erreichbar ist — die Zugangskontrolle (Benutzername/
Passwort) übernimmt dabei der Reverse Proxy, nicht die App:

1. Repository klonen:

   ```
   git clone <repo-url> wiederladen-app
   cd wiederladen-app
   ```

2. `.env` anlegen (kopieren von `.env.example`) und `DOMAIN` auf den echten Domainnamen setzen,
   z.B. `DOMAIN=wiederladen.example.com`.

3. Falls noch nicht vorhanden, das von deinem Reverse-Proxy-Stack verwendete externe
   Docker-Netzwerk anlegen (Name muss zu dem in `docker-compose.prod.yml` passen, per Default
   `proxy`):

   ```
   docker network create proxy
   ```

4. Starten:

   ```
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```

`docker-compose.prod.yml` veröffentlicht **keinen** Port auf dem Host mehr — die App ist nur noch
über das gemeinsame `proxy`-Netzwerk für den Reverse Proxy erreichbar (Service-Name `app`, Port
`3000`). Es enthält beispielhafte Traefik-Labels; bei Caddy/nginx-proxy stattdessen deren
Konfiguration auf `http://app:3000` im selben Netzwerk zeigen lassen.

`ALLOWED_ORIGIN` (aus `DOMAIN` abgeleitet) sorgt dafür, dass Next.js' eingebaute CSRF-Prüfung für
Server Actions Anfragen von der echten Domain akzeptiert.

Updates einspielen: erneut `git pull`, dann Schritt 4 wiederholen (`--build` sorgt für Neubau bei
Codeänderungen; Migrationen laufen beim Start automatisch).

## Entwicklung ohne Docker

```
npm install
npx prisma migrate dev
npm run dev
```

Tests: `npm test` · Typecheck: `npx tsc --noEmit` · Lint: `npm run lint`
