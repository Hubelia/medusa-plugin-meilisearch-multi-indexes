# MeiliSearch

*** This is a WIP, and not toroughly tested.

Provide powerful indexing and searching features in your commerce application with MeiliSearch.

[MeiliSearch Plugin Documentation](https://docs.medusajs.com/plugins/search/meilisearch) | [Medusa Website](https://medusajs.com) | [Medusa Repository](https://github.com/medusajs/medusa)

## Features

- Flexible configurations for specifying searchable and retrievable attributes.
- Ready-integration with [Medusa's Next.js starter storefront](https://docs.medusajs.com/starters/nextjs-medusa-starter).
- Utilize MeiliSearch's powerful search functionalities including typo-tolerance, synonyms, filtering, and more.

---

## Prerequisites

- [Medusa backend](https://docs.medusajs.com/development/backend/install)
- [MeiliSearch instance](https://docs.meilisearch.com/learn/getting_started/quick_start.html#setup-and-installation)

---

## How to Install

1\. Run the following command in the directory of the Medusa backend:

  ```bash
  npm install medusa-plugin-meilisearch-multi-indexes
  ```

2\. Set the following environment variables in `.env`:

  ```bash
  MEILISEARCH_HOST=<YOUR_MEILISEARCH_HOST>
  MEILISEARCH_API_KEY=<YOUR_MASTER_KEY>
  ```

3\. In `medusa-config.js` add the following at the end of the `plugins` array:

  ```js
  const plugins = [
    // ...
    {
      resolve: `medusa-plugin-meilisearch-multi-indexes`,
      options: {
        config: {
          host: process.env.MEILISEARCH_HOST,
          apiKey: process.env.MEILISEARCH_API_KEY,
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: [
                "title", 
                "description",
                "variant_sku",
              ],
              displayedAttributes: [
                "title", 
                "description", 
                "variant_sku", 
                "thumbnail", 
                "handle",
              ],
            },
            primaryKey: "id",
            transformer: (container, product) => ({
              id: product.id, 
              // other attributes...
            }),
            documents: (container, documents) => ({
              id: product.id, 
              // other attributes...
            })

          },
          other_index: {
            indexSettings: {
              searchableAttributes: [
                "title", 
                "description",
                "variant_sku",
              ],
              displayedAttributes: [
                "title", 
                "description", 
                "variant_sku", 
                "thumbnail", 
                "handle",
              ],
            },
            primaryKey: "id",
            transformer: (container, product) => ({
              id: product.id, 
              // other attributes...
            }),
            documents: (container, documents) => {
              // Here you can use the container or any sources to fetch documents
              // and return the list of documents that will be added to the indexes.
              // You can also transform the documents here if needed - or use the transformer
              // to do so.
            }
          },
        },
      },
    },
  ]
  ```

---

## Test the Plugin

1\. Run the following command in the directory of the Medusa backend to run the backend:

  ```bash
  npm run start
  ```

2\. Try searching products either using your storefront or using the [Store APIs](https://docs.medusajs.com/api/store#tag/Product/operation/PostProductsSearch).

---

## Additional Resources

- [MeiliSearch Plugin Documentation](https://docs.medusajs.com/plugins/search/meilisearch)
