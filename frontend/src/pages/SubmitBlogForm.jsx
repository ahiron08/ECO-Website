import { motion } from 'framer-motion';
import Button from '../components/Button';
import SectionTitle from '../components/SectionTitle';
import { useNavigate } from 'react-router-dom';

const GOOGLE_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSewErodmRKwPO7b1LQWYMFALFWZouaiEMq3bgZiZ9vtnEn8pA/viewform?usp=publish-editor';

export default function SubmitBlogForm() {
  const navigate = useNavigate();

  const handleSubmit = () => {
    window.location.href = GOOGLE_FORM_URL;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-20">
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <SectionTitle
            title="Write for the Eco Club Blog"
            subtitle="Share your ideas, reflections, and campus stories with the Eco Club community"
          />
        </div>
      </section>

      <section className="py-12 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-card p-8 lg:p-10"
            >
              <h3 className="text-2xl font-bold text-[#222] mb-4">
                Contribute a Blog Post
              </h3>
              <p className="text-muted mb-6">
                Have thoughts on sustainability, campus green initiatives, or local
                environmental stories? Submit your blog through the form below and
                it may be featured on the Eco Club blog page.
              </p>

              <ul className="space-y-3 mb-8 text-sm text-muted">
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#3FAE5C] flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Share original articles, reflections, event recaps, or eco tips.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#3FAE5C] flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Your submission will be reviewed by the Eco Club team before publishing.
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#3FAE5C] flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Once published, your post will appear on the blog page and help inspire
                  the community.
                </li>
              </ul>

              <Button
                variant="primary"
                onClick={handleSubmit}
                className="w-full"
              >
                Start Writing
              </Button>

              <p className="mt-4 text-sm text-muted text-center">
                You will be redirected to the submission form in a new tab.
              </p>
            </motion.div>

            <div className="bg-[#3FAE5C]/5 rounded-2xl p-6 lg:p-8 border border-[#3FAE5C]/20">
              <p className="text-sm text-muted">
                Already have a published post?{' '}
                <button
                  onClick={() => navigate('/blog')}
                  className="text-[#3FAE5C] font-medium hover:underline"
                >
                  Browse the blog
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
