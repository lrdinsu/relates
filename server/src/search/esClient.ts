import { Client } from '@elastic/elasticsearch';

// Elasticsearch is local-only: search uses it when ELASTICSEARCH_URL is set,
// and falls back to Postgres full-text search otherwise (e.g. in production).
export function isEsEnabled(): boolean {
  return Boolean(process.env.ELASTICSEARCH_URL);
}

let client: Client | null = null;

// Built lazily from env so tests can point it at a Testcontainers node that is
// started after this module is imported.
export function getEsClient(): Client {
  client ??= new Client({
    node: process.env.ELASTICSEARCH_URL ?? 'http://localhost:9200',
  });

  return client;
}
