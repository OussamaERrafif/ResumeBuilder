import { MDXRemote } from 'next-mdx-remote/rsc'
import { getPostBySlug, getPostSlugs } from '@/lib/blog'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, CalendarIcon, UserIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export async function generateStaticParams() {
    const posts = getPostSlugs()
    return posts.map((post) => ({
        slug: post.replace(/\.mdx$/, ''),
    }))
}

type Props = {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    try {
        const resolvedParams = await params
        const post = getPostBySlug(resolvedParams.slug)
        return {
            title: `${post.metadata.title} - ApexResume`,
            description: post.metadata.excerpt,
        }
    } catch {
        return {
            title: 'Post Not Found',
        }
    }
}

export default async function BlogPost({ params }: Props) {
    try {
        const resolvedParams = await params
        const post = getPostBySlug(resolvedParams.slug)

        return (
            <article className="container mx-auto px-4 max-w-4xl">
                <Button variant="ghost" asChild className="mb-8 pl-0 hover:pl-2 hover:bg-transparent transition-all group">
                    <Link href="/blogs" className="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        Back to Blog
                    </Link>
                </Button>

                <div className="space-y-6 mb-12 text-center max-w-3xl mx-auto">
                    <div className="flex flex-wrap justify-center gap-2">
                        {post.metadata.tags?.map(tag => (
                            <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl leading-tight">
                        {post.metadata.title}
                    </h1>
                    <div className="flex items-center justify-center gap-6 text-muted-foreground text-sm">
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {new Date(post.metadata.date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="flex items-center gap-1">
                            <UserIcon className="h-4 w-4" />
                            {post.metadata.author}
                        </span>
                    </div>
                </div>

                {post.metadata.image && (
                    <div className="aspect-[2/1] w-full mb-12 rounded-xl overflow-hidden bg-muted relative">
                        <img
                            src={post.metadata.image}
                            alt={post.metadata.title}
                            className="object-cover w-full h-full"
                        />
                    </div>
                )}

                <div className="prose prose-slate dark:prose-invert max-w-3xl mx-auto prose-lg prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary hover:prose-a:text-primary/80">
                    <MDXRemote source={post.content} />
                </div>

                <div className="mt-20 pt-10 border-t flex justify-center">
                    <div className="text-center space-y-4">
                        <h3 className="text-2xl font-bold">Ready to build your resume?</h3>
                        <p className="text-muted-foreground">Join thousands of job seekers who found success with ApexResume.</p>
                        <Button size="lg" asChild className="mt-4">
                            <Link href="/dashboard">Create My Resume</Link>
                        </Button>
                    </div>
                </div>
            </article>
        )
    } catch {
        notFound()
    }
}
