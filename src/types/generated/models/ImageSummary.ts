/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * ImageSummary image summary
 */
export type ImageSummary = {
    /**
     * Number of containers using this image. Includes both stopped and running
     * containers.
     *
     * This size is not calculated by default, and depends on which API endpoint
     * is used. `-1` indicates that the value has not been set / calculated.
     */
    Containers: number
    /**
     * Date and time at which the image was created as a Unix timestamp
     * (number of seconds sinds EPOCH).
     */
    Created: number
    /**
     * ID is the content-addressable ID of an image.
     *
     * This identifier is a content-addressable digest calculated from the
     * image's configuration (which includes the digests of layers used by
     * the image).
     *
     * Note that this digest differs from the `RepoDigests` below, which
     * holds digests of image manifests that reference the image.
     */
    Id: string
    /**
     * User-defined key/value metadata.
     */
    Labels: Record<string, string>
    /**
     * ID of the parent image.
     *
     * Depending on how the image was created, this field may be empty and
     * is only set for images that were built/created locally. This field
     * is empty if the image was pulled from an image registry.
     */
    ParentId: string
    /**
     * List of content-addressable digests of locally available image manifests
     * that the image is referenced from. Multiple manifests can refer to the
     * same image.
     *
     * These digests are usually only available if the image was either pulled
     * from a registry, or if the image was pushed to a registry, which is when
     * the manifest is generated and its digest calculated.
     */
    RepoDigests: Array<string>
    /**
     * List of image names/tags in the local image cache that reference this
     * image.
     *
     * Multiple image tags can refer to the same image, and this list may be
     * empty if no tags reference the image, in which case the image is
     * "untagged", in which case it can still be referenced by its ID.
     */
    RepoTags: Array<string>
    /**
     * Total size of image layers that are shared between this image and other
     * images.
     *
     * This size is not calculated by default. `-1` indicates that the value
     * has not been set / calculated.
     */
    SharedSize: number
    /**
     * Total size of the image including all layers it is composed of.
     */
    Size: number
    /**
     * Total size of the image including all layers it is composed of.
     *
     * In versions of Docker before v1.10, this field was calculated from
     * the image itself and all of its parent images. Images are now stored
     * self-contained, and no longer use a parent-chain, making this field
     * an equivalent of the Size field.
     *
     * Deprecated: this field is kept for backward compatibility, and will be removed in API v1.44.
     */
    VirtualSize?: number
}
