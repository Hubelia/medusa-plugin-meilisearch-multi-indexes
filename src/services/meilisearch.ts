import { SearchTypes } from "@medusajs/types"
import { SearchUtils } from "@medusajs/utils"
import { AwilixContainer } from "awilix"
import { MeiliSearch, Settings } from "meilisearch"
import { IndexSettings, meilisearchErrorCodes, MeilisearchPluginOptions } from "../types"
import { transformProduct } from '../utils/transformer'


import { variantKeys } from "@medusajs/types"
import { MedusaContainer } from '@medusajs/modules-sdk';

const prefix = `variant`

class MeiliSearchService extends SearchUtils.AbstractSearchService {
  isDefault = false

  protected readonly config_: MeilisearchPluginOptions["config"]
  protected readonly settings_: MeilisearchPluginOptions["settings"]
  protected readonly client_: MeiliSearch
  protected readonly container_: MedusaContainer

  constructor(container: MedusaContainer, options: MeilisearchPluginOptions) {
    super(container, options)

    this.config_ = options.config
    this.settings_ = options.settings
    this.container_ = container

    if (process.env.NODE_ENV !== "development") {
      if (!this.config_?.apiKey) {
        throw Error(
          "Meilisearch API key is missing in plugin config. See https://docs.medusajs.com/add-plugins/meilisearch"
        )
      }
    }

    if (!this.config_?.host) {
      throw Error(
        "Meilisearch host is missing in plugin config. See https://docs.medusajs.com/add-plugins/meilisearch"
      )
    }

    this.client_ = new MeiliSearch(options.config)
  }

  async createIndex(
    indexName: string,
    options: Record<string, unknown> = { primaryKey: "id" }
  ) {
    return await this.client_.createIndex(indexName, options)
  }

  getIndex(indexName: string) {
    return this.client_.index(indexName)
  }

  async addDocuments(indexName: string, documents: any, type: string) {
    const transformedDocuments = await this.getTransformedDocuments(indexName, type, documents || [])

    return await this.client_
      .index(indexName)
      .addDocuments(transformedDocuments)
  }

  async replaceDocuments(indexName: string, documents: any, type: string) {
    const transformedDocuments = await this.getTransformedDocuments(indexName, type, documents || [])

    return await this.client_
      .index(indexName)
      .addDocuments(transformedDocuments)
  }

  async deleteDocument(indexName: string, documentId: string) {
    return await this.client_.index(indexName).deleteDocument(documentId)
  }

  async deleteAllDocuments(indexName: string) {
    return await this.client_.index(indexName).deleteAllDocuments()
  }

  async search(indexName: string, query: string, options: Record<string, any>) {
    const { paginationOptions, filter, additionalOptions } = options

    return await this.client_
      .index(indexName)
      .search(query, { filter, ...paginationOptions, ...additionalOptions })
  }

  async updateSettings(
    indexName: string,
    settings: IndexSettings & Settings
  ) {
    // backward compatibility
    const indexSettings = settings.indexSettings ?? settings ?? {}

    await this.upsertIndex(indexName, settings)

    return await this.client_.index(indexName).updateSettings(indexSettings)
  }

  async upsertIndex(indexName: string, settings: IndexSettings) {
    try {
      await this.client_.getIndex(indexName)
    } catch (error) {
      if (error.code === meilisearchErrorCodes.INDEX_NOT_FOUND) {
        await this.createIndex(indexName, {
          primaryKey: settings?.primaryKey ?? "id",
        })
      }
    }
  }

  async getTransformedDocuments(indexName, type: string, documents: any[]) {
    const documentsFunction = this.settings_?.[type]?.documents
    if (typeof documentsFunction === 'function') {
      documents = await documentsFunction(this.container_, documents)
    }
    if (!documents?.length) {
      return []
    }

    const transformer = await
      this.settings_?.[type].transformer ??
      (type === SearchTypes.indexTypes.PRODUCTS ? transformProduct : (container, document) => document)

    if (!this.settings_?.[type].documents && indexName === "products") {
      documents = documents.filter(i => i.status === 'published')
    }


    const results = await Promise.allSettled(documents.map((i)=> transformer(this.container_, i)));
    const rejected = <T,>(p: PromiseSettledResult<T>): p is PromiseRejectedResult => p.status === 'rejected';

    const errors = results.filter(rejected);
    if (errors.length) {
      console.error('An error occurred while transforming some documents:', errors, `for index ${type}`);
    }

    const fulfilled = <T,>(p: PromiseSettledResult<T>): p is PromiseFulfilledResult<T> => p.status === 'fulfilled';
    return results.filter(fulfilled).map((r) => r.value);
  }
}

export default MeiliSearchService