import { AwilixContainer } from 'awilix';
import { Config } from "meilisearch"

export const meilisearchErrorCodes = {
  INDEX_NOT_FOUND: "index_not_found",
}
// override SearchTypes.IndexSettings transformer to accept container as a second argument and add
// a new "documents" property to the interface that returns a function

export declare type IndexSettings = {
  /**
   * Settings specific to the provider. E.g. `searchableAttributes`.
   */
  indexSettings: Record<string, unknown>;
  /**
   * Primary key for the index. Used to enforce unique documents in an index. See more in Meilisearch' https://docs.meilisearch.com/learn/core_concepts/primary_key.html.
   */
  primaryKey?: string;
  /**
   * Document transformer. Used to transform documents before they are added to the index.
   */
  transformer?: (container: AwilixContainer, document: any) => any;
  /**
   * Document transformer. Used to transform documents before they are added to the index.
   */
  documents?: (container: AwilixContainer, documents: any) => any;
};

export interface MeilisearchPluginOptions {
  /**
   * Meilisearch client configuration
   */
  config: Config
  /**
   * Index settings
   */
  settings?: {
    [key: string]: IndexSettings
  }
}
