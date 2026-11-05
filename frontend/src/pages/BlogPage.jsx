import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import SectionTitle from '../components/SectionTitle';
import BlogCard from '../components/BlogCard';
import Button from '../components/Button';
import { useBlogs } from '../hooks/useContent';

const baseCategories = ['Sustainability', 'Conservation', 'Climate', 'Technology', 'Waste Management', 'Water'];

export default function BlogPage() {
  const { data: blogsData, loading, error, refetch } = useBlogs();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const blogs = useMemo(() => blogsData ?? [], [blogsData]);
  const featuredBlog = blogs[0];

  const categories = useMemo(() => {
    const extra = blogs
      .map((blog) => blog.category)
      .filter((category) => category && category !== 'All');

    return ['All', ...new Set([...baseCategories, ...extra])];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return blogs.filter((blog) => {
      const matchesCategory = activeCategory === 'All' || blog.category === activeCategory;
      const matchesSearch = !query
        || blog.title.toLowerCase().includes(query)
        || blog.excerpt.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, blogs, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      {/* Hero Section */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Blog"
            subtitle="Stories, insights, and updates from Eco Club"
          />
        </div>
      </section>

      {/* Featured Post */}
      {featuredBlog && (
        <section className="py-12 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-2xl overflow-hidden shadow-soft">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2">
                  {featuredBlog.image ? (
                    <img
                      src={featuredBlog.image}
                      alt={featuredBlog.title}
                      className="w-full h-64 lg:h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-[#e8f3e4] to-[#cfe6cb] lg:h-full">
                      <span className="text-sm font-medium text-[#3FAE5C]">Eco Club Blog</span>
                    </div>
                  )}
                </div>
                <div className="lg:w-1/2 p-8 lg:p-12">
                  <span className="text-sm font-medium text-[#3FAE5C] mb-2 block">Featured</span>
                  <h2 className="text-3xl font-bold text-[#222] mb-4">{featuredBlog.title}</h2>
                  <p className="text-muted mb-6">{featuredBlog.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">{featuredBlog.date}</span>
                    <Link
                      to={`/blog/${featuredBlog.id}`}
                      state={{ from: '/blog' }}
                      className="text-[#3FAE5C] font-medium hover:underline"
                    >
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters and Search */}
      <section className="py-8 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Category Chips */}
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category
                      ? 'bg-[#3FAE5C] text-white'
                      : 'bg-white text-[#222] border border-[#ECECEC] hover:border-[#3FAE5C]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-64">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="search"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#ECECEC] focus:outline-none focus:ring-2 focus:ring-[#3FAE5C] bg-white"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading && blogs.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#3FAE5C] border-t-transparent" />
              <p className="text-muted">Loading blog posts…</p>
            </div>
          )}

          {!loading && error && blogs.length === 0 && (
            <div className="mx-auto max-w-xl rounded-2xl border border-[#ECECEC] bg-white p-8 text-center shadow-card">
              <p className="text-xl font-semibold text-[#222]">We couldn’t load the blog.</p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-5 rounded-full bg-[#3FAE5C] px-6 py-2.5 font-medium text-white transition hover:bg-[#359a4f]"
              >
                Try again
              </button>
            </div>
          )}

          <motion.div
            layout
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredBlogs.map((blog, index) => (
              <BlogCard key={blog.id} blog={blog} index={index} />
            ))}
          </motion.div>

          {!loading && filteredBlogs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-xl text-muted">
                {blogs.length === 0
                  ? 'No blog posts have been published yet.'
                  : 'No blogs found matching your criteria.'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Submit Your Own Blog */}
      <section className="px-6 pb-16 pt-4 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-[#ECECEC] bg-white px-6 py-10 text-center shadow-card sm:px-10"
          >
            <h2 className="mb-4 text-2xl font-bold text-[#222]">
              Want to contribute?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-muted">
              Share your ideas, stories, or reflections with the Eco Club community.
              Submit your own blog through the form to get started.
            </p>
            <Button
              variant="secondary"
              href="/blog/submit"
              className="inline-flex items-center gap-2"
            >
              Write for the Blog
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
