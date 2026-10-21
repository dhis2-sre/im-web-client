const ghcrRepositoryPattern = /^ghcr\.io\/([^/]+)\/([^/]+)$/

/* An image repository given as a full GHCR reference, such as ghcr.io/dhis2/core-embargoed, split into the
 * organization and repository the /integrations endpoints take. Anything else is a Docker Hub repository name. */
export const parseGhcrRepository = (repository?: string) => {
    const match = typeof repository === 'string' ? ghcrRepositoryPattern.exec(repository) : null
    return match ? { organization: match[1], repository: match[2] } : undefined
}
