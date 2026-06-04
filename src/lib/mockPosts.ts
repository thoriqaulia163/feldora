import type { Post } from './graphql'

const CATEGORIES = [
  { name: 'Technology', slug: 'technology' },
  { name: 'Design', slug: 'design' },
  { name: 'Engineering', slug: 'engineering' },
  { name: 'Creative', slug: 'creative' },
]

const IMAGES = [
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop',
]

const TITLES = [
  'Building Scalable Web Architecture',
  'The Art of Minimal Design',
  'Performance Optimization Deep Dive',
  'Modern CSS Techniques for 2026',
  'Server Components Revolution',
  'Typography in Digital Spaces',
  'The Future of Web Animations',
  'Dark Mode Design Principles',
  'Accessibility Beyond Compliance',
  'State Management Patterns',
  'Edge Computing for Frontend',
  'Design Systems at Scale',
  'WebAssembly in Production',
  'Micro-Frontends Architecture',
  'Real-Time Data Visualization',
  'Progressive Enhancement Strategy',
  'Component-Driven Development',
  'API Design Best Practices',
  'Testing Strategies for Modern Apps',
  'Containerized Frontend Deployments',
  'GraphQL Schema Design',
  'Responsive Images Masterclass',
  'Web Security Fundamentals',
  'Monorepo Tooling Guide',
  'CSS Grid Advanced Layouts',
  'React Server Actions',
  'Database-Driven UI Patterns',
  'Streaming SSR Explained',
  'Bundle Size Optimization',
  'Design Tokens Implementation',
  'Error Handling Strategies',
  'Feature Flags at Scale',
  'Caching Strategies Compared',
  'CI/CD Pipeline for Frontend',
  'Browser Storage Deep Dive',
  'Animation Performance Tips',
]

function generateMockPosts(count: number): Post[] {
  return Array.from({ length: count }, (_, i) => ({
    author: { name: 'Feldora', id: `author-${i}`, bio: 'Digital craftsman' },
    createdAt: new Date(2026, 0, 1 - i).toISOString(),
    slug: TITLES[i % TITLES.length].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: TITLES[i % TITLES.length],
    excerpt: `An in-depth exploration of ${TITLES[i % TITLES.length].toLowerCase()} and how it shapes the modern web development landscape.`,
    featuredImage: { url: IMAGES[i % IMAGES.length] },
    category: [CATEGORIES[i % CATEGORIES.length]],
  }))
}

const ALL_MOCK_POSTS = generateMockPosts(36)

export interface PaginatedPostsResult {
  posts: Post[]
  hasNextPage: boolean
  totalCount: number
}

export async function getMockPostsPaginated(
  page: number,
  perPage: number = 12
): Promise<PaginatedPostsResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const start = page * perPage
  const end = start + perPage
  const posts = ALL_MOCK_POSTS.slice(start, end)

  return {
    posts,
    hasNextPage: end < ALL_MOCK_POSTS.length,
    totalCount: ALL_MOCK_POSTS.length,
  }
}
