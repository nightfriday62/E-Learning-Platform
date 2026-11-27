DB dump directory

This folder contains JSON exports of MongoDB collections. Use the project-level npm scripts to export/import.

Export collections to `db-dump-json/`:

  npm run db:export

Import collections from `db-dump-json/` into the database (this will replace data):

  npm run db:import

The scripts load `Backend/.env` when run from the backend directory. Set
`MONGO_DB` to the target database name; it is required and overrides any
database name in the URI. Set `MONGO_URI` to the MongoDB server URI for these
scripts; it defaults to `mongodb://localhost:27017`. The application server
uses `MONGODB_URI` instead, so set `MONGO_URI` separately when importing or
exporting a remote database. Check both settings before importing, since
the import replaces data.

Do NOT commit sensitive data. These files are useful for sharing small development datasets.
