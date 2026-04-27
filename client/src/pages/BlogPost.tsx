import { useParams, Link } from "wouter";
import { usePageMeta } from "@/lib/usePageMeta";
import { getBlogArticle, BLOG_ARTICLES } from "@/lib/blogData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdSlot, { InContentAd } from "@/components/AdSlot";
import Footer from "@/components/Footer";
import BottomTabNav from "@/components/BottomTabNav";
import { ArrowLeft, Clock, ChevronRight, BookOpen } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const article = getBlogArticle(slug ?? "");

  usePageMeta({
    title: article ? article.metaTitle : "Article Not Found",
    description: article ? article.metaDescription : "This article could not be found.",
    canonicalPath: article ? `/blog/${article.slug}` : "/blog",
  });

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h1 className="text-xl font-bold">Article not found</h1>
        <Link href="/blog">
          <button className="text-sm text-violet-600 underline">Back to Blog</button>
        </Link>
      </div>
    );
  }

  const related = BLOG_ARTICLES.filter(
    (a) => a.slug !== article.slug && a.category === article.category
  ).slice(0, 3);

  const allRelated =
    related.length < 2
      ? BLOG_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3)
      : related;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Organization", name: "ToyPetMe", url: "https://toypetme.com" },
    publisher: {
      "@type": "Organization",
      name: "ToyPetMe",
      logo: { "@type": "ImageObject", url: "https://toypetme.com/og-image.svg" },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://toypetme.com/blog/${article.slug}` },
    keywords: article.keywords.join(", "),
  };

  const faqJsonLd = article.faq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      }
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <div className="max-w-2xl mx-auto w-full flex-1 px-4 pt-4 pb-32">
        {/* Back nav */}
        <div className="flex items-center gap-2 mb-4">
          <Link href="/blog">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft size={18} className="text-muted-foreground" />
            </button>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium truncate max-w-[200px]">{article.category}</span>
          </div>
        </div>

        <AdSlot format="banner" className="mb-4" />

        {/* Article Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="secondary">{article.category}</Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock size={11} />
              {article.readTime}
            </span>
            <span className="text-xs text-muted-foreground">
              {new Date(article.date).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
          <h1 className="text-xl font-bold text-foreground leading-snug mb-3">
            {article.title}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed border-l-4 border-violet-400 pl-3 py-1 bg-violet-50 dark:bg-violet-900/20 rounded-r-md">
            {article.intro}
          </p>
        </div>

        {/* Article Sections — with in-content ad after the 3rd section */}
        <div className="space-y-6 mb-6">
          {article.sections.map((section, i) => (
            <div key={i}>
              {i === 3 && <InContentAd format="rectangle" />}
              <h2 className="text-base font-bold text-foreground mb-2">{section.heading}</h2>
              <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
                {section.body.split("\n").map((para, j) =>
                  para.trim() === "" ? null : (
                    <p key={j} className={para.startsWith("•") ? "pl-3" : ""}>
                      {para}
                    </p>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        <AdSlot format="rectangle" className="mb-6" />

        {/* Conclusion */}
        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-4 mb-6">
          <h2 className="text-sm font-bold text-foreground mb-2">Summary</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{article.conclusion}</p>
        </div>

        {/* FAQ */}
        {article.faq && article.faq.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground mb-3">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {article.faq.map((item, i) => (
                <div key={i} className="bg-muted/40 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-1">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-xl p-5 mb-6 text-center">
          <p className="text-white font-bold text-base mb-1">Play ToyPetMe Free</p>
          <p className="text-white/80 text-xs mb-3">No sign-up. No download. Instant play on any device.</p>
          <Link href="/">
            <button className="bg-white text-violet-700 font-bold text-sm px-6 py-2 rounded-full hover:bg-white/90 transition-colors">
              Adopt Your Pet Now
            </button>
          </Link>
        </div>

        {/* In-content ad before related articles */}
        <InContentAd format="banner" />

        {/* Related Articles */}
        {allRelated.length > 0 && (
          <div className="mb-6">
            <h2 className="text-base font-bold text-foreground mb-3">Related Articles</h2>
            <div className="space-y-2">
              {allRelated.map((rel) => (
                <Link key={rel.slug} href={`/blog/${rel.slug}`}>
                  <Card className="cursor-pointer hover-elevate">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                        <BookOpen size={14} className="text-violet-600 dark:text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug">{rel.title}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{rel.readTime} · {rel.category}</p>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Footer />
      </div>
      <BottomTabNav />
    </div>
  );
}
