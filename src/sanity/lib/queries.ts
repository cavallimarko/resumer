import { defineQuery } from 'next-sanity'

export const POSTS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)]|order(publishedAt desc)[0...12]{
  _id,
  title,
  slug,
  body,
  mainImage,
  publishedAt,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`)

export const POSTS_SLUGS_QUERY =
  defineQuery(`*[_type == "post" && defined(slug.current)]{ 
  "slug": slug.current
}`)

export const POST_QUERY =
  defineQuery(`*[_type == "post" && slug.current == $slug][0]{
  _id,
  title,
  body,
  mainImage,
  publishedAt,
  "categories": coalesce(
    categories[]->{
      _id,
      slug,
      title
    },
    []
  ),
  author->{
    name,
    image
  }
}`)

// Add the bio query
export const BIO_QUERY = 
  defineQuery(`*[_type == "bio"][0]{
  _id,
  title,
  subtitle,
  image,
  content,
  skills
}`)

// Add the homepage posts query
export const HOMEPAGE_POSTS_QUERY = 
  defineQuery(`*[_type == "post"] {
    _id,
    title,
    slug,
    "mainImage": mainImage.asset->url,
    categories[]->{ title }
  }`)

// Add the categories query
export const CATEGORIES_QUERY = 
  defineQuery(`*[_type == "category"] {
    _id,
    title
  }`)

// Add the header query
export const HEADER_QUERY = 
  defineQuery(`*[_type == "header"][0]{
    title,
    subtitle,
    mainNavigation[]{
      title,
      linkType,
      url,
      isExternal,
      internalLink->{
        _type,
        "slug": slug.current
      }
    },
    showStudioLink
  }`)