import { MedusaContainer } from "@medusajs/modules-sdk"
import MeiliSearchService from "../services/meilisearch"
import { MeilisearchPluginOptions } from "../types"
import { Logger } from "@medusajs/types"


export default async (
  container: MedusaContainer,
  options: MeilisearchPluginOptions
) => {
  const logger: Logger = container.resolve("logger")

  try {
    const meilisearchService: MeiliSearchService =
      container.resolve("meilisearchService")

    const { settings } = options
    await Promise.all(Object.entries(settings || {}).map(async ([indexName, value]) => {
      await meilisearchService.updateSettings(indexName, value)
      if (value.documents) {
        await meilisearchService.addDocuments(indexName, [], 'products')
      }
    })
    )
  } catch (err) {
    // ignore
    logger.warn(err)
  }
}
