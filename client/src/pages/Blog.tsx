import { Link } from "wouter";
import { usePageMeta } from "@/lib/usePageMeta";
import { BLOG_ARTICLES, BLOG_CATEGORIES } from "@/lib/blogData";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import BottomTabNav from "@/components/BottomTabNav";
import { BookOpen, Clock, ChevronRight, ArrowLeft } from "lucide-react";

export default function Blog() {
  usePageMeta({
    title: "Blog — Virtual Pet Tips, Guides & News",
    description:
      "ToyPetMe blog: expert guides, tips and tricks, virtual pet game news, evolution walkthroughs, achievement guides, and more. Free virtual pet game articles 2025.",
    canonicalPath: "/blog",
  });

  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? BLOG_ARTICLES
      : BLOG_ARTICLES.filter((a) => a.category === activeCategory);

  const featured = BLOG_ARTICLES[0];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 px-4 pt-4 pb-32">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/">
            <button className="p-2 rounded-full hover:bg-muted transition-colors">
              <ArrowLeft size={18} className="text-muted-foreground" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-foreground">ToyPetMe Blog</h1>
            <p className="text-xs text-muted-foreground">Guides, tips, news & virtual pet stories</p>
          </div>
        </div>

        <AdSlot format="banner" className="mb-4" />

        {/* Featured Article */}
        <Link href={`/blog/${featured.slug}`}>
          <Card className="mb-6 cursor-pointer hover-elevate overflow-hidden">
            <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-600 px-5 py-6">
              <Badge className="mb-3 bg-white/20 text-white border-0 text-[10px] uppercase tracking-wider">
                Featured
              </Badge>
              <h2 className="text-lg font-bold text-white leading-snug mb-2">
                {featured.title}
              </h2>
              <p className="text-sm text-white/80 line-clamp-2 mb-3">
                {featured.intro}
              </p>
              <div className="flex items-center gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {featured.readTime}
                </span>
                <span>{featured.category}</span>
                <span>{new Date(featured.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </Card>
        </Link>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 scrollbar-none">
          {BLOG_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                activeCategory === cat
                  ? "bg-violet-600 text-white border-violet-600"
                  : "bg-background text-muted-foreground border-border hover:border-violet-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article Grid */}
        <div className="space-y-3 mb-6">
          {filtered.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`}>
              <Card className="cursor-pointer hover-elevate">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen size={18} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-[10px] py-0 h-4 shrink-0">
                          {article.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground shrink-0">{article.readTime}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-foreground leading-snug mb-1 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {article.intro}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0 mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <AdSlot format="rectangle" className="mb-4" />

        {/* SEO Text Block */}
        <div className="bg-muted/30 rounded-lg p-4 mb-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">About ToyPetMe</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            ToyPetMe is a free virtual pet browser game inspired by the classic Tamagotchi. Adopt one of five unique virtual pet species — Mystic Cat, Star Pup, Fire Drake, Moon Bunny, or Crystal Axolotl — and raise them through four evolution stages from Baby to Adult. No download required, no sign-up, no subscription. Play instantly at ToyPetMe.com on any device.
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            This blog covers everything you need to know about ToyPetMe: beginner guides, advanced strategy, evolution guides, achievement walkthroughs, mini-game tips, and the broader world of virtual pet games. Updated regularly with new content.
          </p>
        </div>

        <Footer />
      </div>
      <BottomTabNav />
    </div>
  );
}
