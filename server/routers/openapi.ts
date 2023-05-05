import { generateOpenApiDocument } from 'trpc-openapi'

import { appRouter } from './_app'

// Generate OpenAPI schema document
export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: 'Contract Verification API',
  description: 'API for contract verification',
  version: '1.0.0',
  baseUrl: 'http://localhost:3000/api',
  tags: ['contract']
})
