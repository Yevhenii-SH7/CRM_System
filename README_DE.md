# CRM-Aufgabenplaner

Ein umfassendes Projektmanagementsystem für Freiberufler.

## Funktionen

- Benutzerauthentifizierung (JWT)
- Aufgabenverwaltung mit Kanban-Board
- Projektverfolgung
- Kundenverwaltung
- Dashboard mit Kennzahlen und Analysen
- Responsives Design für Mobilgeräte

## Voraussetzungen

- Docker und Docker Compose
- Node.js (für die Entwicklung)
- PHP 8.1+ (für die Entwicklung)
- MySQL (für die Entwicklung)

## Entwicklungs-Setup

1. Repository klonen:
```bash
git clone <Repository-URL>
cd crm_task_planner
```

2. Entwicklungsumgebung starten:
```bash
docker-compose up -d
```

3. Anwendung aufrufen:
- Frontend: http://localhost:3009
- Backend-API: http://localhost:8080
- phpMyAdmin: http://localhost:8083

## Produktions-Setup

1. Produktionsumgebung erstellen und starten:
```bash
docker-compose -f docker-compose.production.yml up --build -d
```

2. Zugriff auf die Anwendung:
- Frontend: http://localhost:3000
- Backend-API: http://localhost:8080

## Umgebungsvariablen

### Frontend
- `VITE_API_URL`: Backend-API-URL (Standard: http://localhost:8080 in der Produktion)

### Backend
- `DB_HOST`: Datenbankhost (Standard: MySQL)
- `DB_PORT`: Datenbankport (Standard: 3306)
- `DB_NAME`: Datenbankname (Standard: crm_db)
- `DB_USER`: Datenbankbenutzer (Standard: crm_user)
- `DB_PASSWORD`: Datenbankpasswort (Standard: crm_password)
- `JWT_SECRET`: JWT-Geheimschlüssel
- `JWT_EXPIRATION`: JWT-Ablaufzeit in Sekunden (Standard: 86400)
- `CORS_ALLOWED_ORIGINS`: Kommagetrennte Liste zulässiger Ursprünge (Standard: http://localhost:3000)

## API-Endpunkte

- `GET /api.php?action=dashboard_summary` – Dashboard-Metriken abrufen
- `GET /api.php?action=recent_tasks` – Aktuelle Aufgaben abrufen
- `GET /api.php?action=active_projects` – Aktive Projekte abrufen
- `GET /api.php?action=tasks[&deleted=true]` – Alle Aufgaben abrufen (optional auch gelöschte)
- `POST /api.php?action=tasks` – Neue Aufgabe erstellen
- `PUT /api.php?action=tasks&id={id}` – Aufgabe aktualisieren
- `DELETE /api.php?action=tasks&id={id}[&permanent=true]` – Aufgabe löschen/archivieren
- `GET /api.php?action=projects` – Alle Projekte abrufen
- `POST /api.php?action=projects` – Neues Projekt erstellen
- `PUT /api.php?action=projects&id={id}` – Projekt aktualisieren
- `DELETE /api.php?action=projects&id={id}` – Projekt löschen
- `GET /api.php?action=clients` – Alle Kunden abrufen
- `POST /api.php?action=clients` – Neuen Kunden erstellen
- `PUT /api.php?action=clients&id={id}` – Kunden aktualisieren
- `DELETE /api.php?action=clients&id={id}` – Kunden löschen
- `POST /api.php?action=login` – Benutzeranmeldung
- `POST /api.php?action=register` – Benutzerregistrierung
– `GET /api.php?action=users` – Alle Benutzer abrufen
– `PUT /api.php?action=users&id={id}` – Benutzer aktualisieren

## Datenbankschema

Die Datenbank wird automatisch mit dem in `database/init.sql` definierten Schema initialisiert.

## Fehlerbehebung

### CORS-Probleme
Wenn CORS-Fehler auftreten, stellen Sie Folgendes sicher:
1. Die Umgebungsvariable „CORS_ALLOWED_ORIGINS“ ist im Backend korrekt gesetzt.
2. Das Frontend sendet Anfragen an die richtige API-URL.

### Probleme mit der Datenbankverbindung
Wenn die Anwendung keine Verbindung zur Datenbank herstellen kann:
1. Überprüfen Sie, ob der Datenbankdienst ausgeführt wird.
2. Überprüfen Sie die Datenbankanmeldeinformationen in den Umgebungsvariablen.
3. Stellen Sie sicher, dass die Datenbank mit dem Schema initialisiert wurde.

### Probleme mit der API-URL
Wenn das Frontend keine Verbindung zur richtigen Backend-URL herstellt:
1. Überprüfen Sie, ob die Umgebungsvariable „VITE_API_URL“ korrekt gesetzt ist.
2. Erstellen Sie das Frontend gegebenenfalls neu.

## Entwicklungshinweise

– Das Frontend verwendet React mit TypeScript und Vite.
– Das Backend verwendet PHP mit einer MySQL-Datenbank.
– Alle Dienste sind für eine einfache Bereitstellung mit Docker containerisiert.
– Die Anwendung folgt einem responsiven Designansatz.