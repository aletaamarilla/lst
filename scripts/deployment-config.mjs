// The destination URL is a secret held only in Sanity/Vercel settings.
// Both before/after are needed: unpublish and delete have no after document.
export const sanityWebhook = Object.freeze({
  type: 'document',
  name: 'LST production published trips → Vercel',
  description: 'Rebuild aletaamarilla/lst main in Vercel production. No draft or release events.',
  dataset: 'production',
  apiVersion: 'v2025-02-19',
  httpMethod: 'POST',
  includeDrafts: false,
  includeAllVersions: false,
  isDisabledByUser: false,
  rule: {
    on: ['create', 'update', 'delete'],
    filter: '(before()._type == "trip" || after()._type == "trip") && !(coalesce(after()._id, before()._id) in path("drafts.**")) && !(coalesce(after()._id, before()._id) in path("versions.**"))',
    projection: '{"id": coalesce(after()._id, before()._id), "operation": delta::operation(), "projectId": sanity::projectId(), "dataset": sanity::dataset()}',
  },
});
