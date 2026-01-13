import Link from 'next/link'
import { getAllPosts } from '@/lib/blog'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon } from "lucide-react"

export const metadata = {
    title: 'Blog - ApexResume',
    description: 'Career advice, resume tips, and industry insights.',
}

export default function BlogIndex() {
    const posts = getAllPosts()

    return (
        <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
                        Our Insights
                    </h1>
                    <p className="text-xl text-muted-foreground mx-auto max-w-2xl">
                        Expert advice to help you build the perfect resume and land your dream job.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Link key={post.slug} href={`/blogs/${post.slug}`} className="group h-full">
                            <Card className="h-full overflow-hidden border-muted/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300 flex flex-col">
                                {post.metadata.image && (
                                    <div className="aspect-video w-full overflow-hidden bg-muted">
                                        {/* Using img for simplicity, next/image would require configuring domains or local import */}
                                        <img
                                            src={post.metadata.image}
                                            alt={post.metadata.title}
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                )}
                                <CardHeader className="space-y-4 flex-1">
                                    <div className="flex flex-wrap gap-2">
                                        {post.metadata.tags?.slice(0, 3).map(tag => (
                                            <Badge key={tag} variant="secondary" className="font-normal text-xs px-2 py-0.5">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="space-y-2">
                                        <CardTitle className="text-xl leading-tight group-hover:text-primary transition-colors">
                                            {post.metadata.title}
                                        </CardTitle>
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <CalendarIcon className="mr-1 h-3 w-3" />
                                            {new Date(post.metadata.date).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                    <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                                        {post.metadata.excerpt}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
