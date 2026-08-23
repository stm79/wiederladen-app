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

## Produktions-Deployment (Linux-Server + Reverse Proxy auf anderem Host)

Setup: App läuft auf einem internen Linux-Host, ein Reverse Proxy auf einem anderen Host im
selben internen Netzwerk übernimmt die Zugangskontrolle (Benutzername/Passwort) und ist als
einziger der beiden Hosts vom Internet aus erreichbar.

1. Repository klonen:

   ```
   git clone https://github.com/stm79/wiederladen-app.git
   cd wiederladen-app
   ```

2. `.env` anlegen (kopieren von `.env.example`) und `DOMAIN` auf den echten, öffentlichen
   Domainnamen setzen, unter dem der Reverse Proxy die App ausliefert, z.B.
   `DOMAIN=wiederladen.example.com`. Das ist nötig, damit Next.js' eingebaute CSRF-Prüfung für
   Server Actions Anfragen von dieser Domain akzeptiert — ohne das schlagen Formulare hinter dem
   Proxy mit "Invalid Server Action request" fehl.

3. Starten:

   ```
   docker compose up -d --build
   ```

   Das veröffentlicht Port 3000 auf dem App-Host (im internen Netz, nicht am Internet), genau wie
   im lokalen Setup oben.

4. Auf dem Reverse-Proxy-Host die App als Backend eintragen: `http://<interne-IP-des-App-Hosts>:3000`.
   Der Proxy muss den ursprünglichen `Host`-Header (die öffentliche Domain) beim Weiterleiten
   erhalten bzw. per `X-Forwarded-Host` durchreichen — das ist bei Caddy/Traefik/nginx-proxy
   standardmäßig der Fall.

Updates einspielen: `git pull`, dann Schritt 3 wiederholen (`--build` sorgt für Neubau bei
Codeänderungen; Migrationen laufen beim Start automatisch).

## Entwicklung ohne Docker

```
npm install
npx prisma migrate dev
npm run dev
```

Tests: `npm test` · Typecheck: `npx tsc --noEmit` · Lint: `npm run lint`
