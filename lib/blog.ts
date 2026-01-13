import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const postsDirectory = path.join(process.cwd(), 'content/blogs')

export type Post = {
    slug: string
    metadata: {
        title: string
        date: string
        excerpt: string
        author: string
        image?: string
        tags?: string[]
        [key: string]: any
    }
    content: string
}

export function getPostSlugs() {
    if (!fs.existsSync(postsDirectory)) return []
    return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.mdx'))
}

export function getPostBySlug(slug: string): Post {
    const realSlug = slug.replace(/\.mdx$/, '')
    const fullPath = path.join(postsDirectory, `${realSlug}.mdx`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
        slug: realSlug,
        metadata: data as Post['metadata'],
        content,
    }
}

export function getAllPosts(): Post[] {
    const slugs = getPostSlugs()
    const posts = slugs
        .map((slug) => getPostBySlug(slug))
        // sort posts by date in descending order
        .sort((post1, post2) => (post1.metadata.date > post2.metadata.date ? -1 : 1))
    return posts
}
