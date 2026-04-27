import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import AdSlot, { InContentAd } from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { BookOpen, Heart, ArrowLeft } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

export interface StoryData {
  slug: string;
  species: string;
  name: string;
  tagline: string;
  gradient: string;
  iconColor: string;
  story: string;
  funFact: string;
  metaTitle: string;
  metaDescription: string;
}

export const STORIES: StoryData[] = [
  {
    slug: "mystic-cat",
    species: "cat",
    name: "Mystic Cat",
    tagline: "Born from starlight and midnight",
    gradient: "from-violet-500 to-purple-700",
    iconColor: "text-violet-200",
    metaTitle: "Mystic Cat Lore — ToyPetMe",
    metaDescription: "Discover the ancient origins of the Mystic Cat, a virtual pet born from starlight. Read its lore and raise your own in ToyPetMe.",
    story:
      "Long before the moon had a name, there lived a cat who watched the cosmos swirl into existence. Its eyes carry the memory of a thousand galaxies collapsing and blooming again. Mystic Cats do not sleep — they wander between dreams, collecting the whispers of stars that have already gone dark. If yours blinks at you slowly, that is the ancient greeting of a being older than time. Keep it well-fed, keep it happy, and on the rarest nights you might see faint starlight glow from the tips of its fur.",
    funFact: "Mystic Cats purr at a frequency that is said to calm nearby electronics.",
  },
  {
    slug: "star-pup",
    species: "dog",
    name: "Star Pup",
    tagline: "Woven from comet tails and laughter",
    gradient: "from-yellow-400 to-orange-500",
    iconColor: "text-yellow-100",
    metaTitle: "Star Pup Lore — ToyPetMe",
    metaDescription: "Learn about the Star Pup, a virtual dog born from leftover stardust and endless joy. Raise yours in ToyPetMe — free to play!",
    story:
      "Every time a shooting star streaks across the sky and a child forgets to make a wish, the leftover stardust tumbles earthward and becomes a Star Pup. That is why they always look slightly confused — they were meant to be something grander, but they chose joy instead. Star Pups have boundless energy because each one carries a tiny star inside their chest that never fully cools. They love you loudly and without apology. Scientists have tried to measure a Star Pup's tail-wag speed, but the instruments keep overheating.",
    funFact: "A Star Pup's bark, at its highest pitch, briefly appears on radio telescopes as signal noise.",
  },
  {
    slug: "fire-drake",
    species: "dragon",
    name: "Fire Drake",
    tagline: "Ancient fury, infinite potential",
    gradient: "from-red-500 to-rose-700",
    iconColor: "text-red-100",
    metaTitle: "Fire Drake Lore — ToyPetMe",
    metaDescription: "Uncover the ancient history of the Fire Drake dragon — older than continents, loyal beyond measure. Hatch yours in ToyPetMe.",
    story:
      "Fire Drakes hatched before the continents fully separated. Most slept through the age of dinosaurs, the ice age, and several civilizations rising and falling — so they find your daily problems somewhat quaint. That said, they are fiercely loyal to whoever hatches their egg. Each Drake carries a flame inside its belly that burns hotter as it ages, eventually hot enough to forge metals that don't yet have names. Do not be fooled by the egg stage — even then, the Drake inside is already memorizing your face and deciding whether you are worthy.",
    funFact: "A Fire Drake sneeze at full power registers as a small earthquake in a 2 km radius.",
  },
  {
    slug: "moon-bunny",
    species: "bunny",
    name: "Moon Bunny",
    tagline: "Racing moonbeams since the first night",
    gradient: "from-sky-400 to-indigo-500",
    iconColor: "text-sky-100",
    metaTitle: "Moon Bunny Lore — ToyPetMe",
    metaDescription: "Meet the Moon Bunny — a magical rabbit that leaps between reflections and always knows how you feel. Raise one in ToyPetMe.",
    story:
      "There is an old legend that says the first Moon Bunny was found hiding inside a crescent moon, using it as a hammock. It tumbled out when the moon waxed full and has been racing ever since. Moon Bunnies can hop between reflections — jump into a puddle on one side of town and emerge from a window reflection across the city. Their long ears are not just for hearing. They also act as antennae, tuning into the emotional frequencies of everyone around them. A Moon Bunny always knows when you are sad before you do.",
    funFact: "Moon Bunnies can cover 200 metres in a single hop if properly motivated by a distant carrot.",
  },
  {
    slug: "crystal-axolotl",
    species: "axolotl",
    name: "Crystal Axolotl",
    tagline: "The rarest light under the deepest sea",
    gradient: "from-cyan-400 to-teal-600",
    iconColor: "text-cyan-100",
    metaTitle: "Crystal Axolotl Lore — ToyPetMe",
    metaDescription: "Discover the Crystal Axolotl — a semi-translucent water creature of extraordinary rarity. Raise the rarest pet in ToyPetMe.",
    story:
      "Crystal Axolotls were believed to be myths until one surfaced in an underground lake during a rare alignment of three moons. Their bodies are semi-translucent at full maturity, and if you look closely through their sides you can see crystalline structures where other creatures have organs. They do not age normally — a Crystal Axolotl may spend decades as a larva before deciding the time is right. Their gill frills sense magic as easily as they sense water currents. To own one is a sign of extraordinary luck, or perhaps the universe recognizing something special in you.",
    funFact: "Crystal Axolotls can regenerate any part of their body, including parts that were never there to begin with.",
  },
];

// Individual story detail page with unique per-story meta
export function StoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const story = STORIES.find((s) => s.slug === slug);

  usePageMeta({
    title: story?.metaTitle ?? "Pet Story — ToyPetMe",
    description: story?.metaDescription ?? "Read the origin story of a ToyPetMe virtual pet species.",
    canonicalPath: `/stories/${slug}`,
  });

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
        <GameHeader />
        <div className="max-w-2xl mx-auto px-4 pt-12 text-center">
          <p className="text-muted-foreground mb-4">Story not found.</p>
          <Button onClick={() => setLocation("/stories")} data-testid="btn-back-stories">
            Back to All Stories
          </Button>
        </div>
        <BottomTabNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <Button
          variant="ghost"
          className="gap-2 mb-4"
          onClick={() => setLocation("/stories")}
          data-testid="btn-back-stories"
        >
          <ArrowLeft size={16} />All Stories
        </Button>

        <AdSlot format="banner" className="mx-auto mb-5" />

        <Card className="overflow-hidden" data-testid={`story-detail-${story.species}`}>
          <div className={`bg-gradient-to-r ${story.gradient} p-6`}>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {story.name}
                </h1>
                <p className={`text-sm font-medium ${story.iconColor} italic`}>"{story.tagline}"</p>
              </div>
              <Button
                size="default"
                variant="outline"
                className="bg-white/15 text-white border-white/30 font-semibold"
                onClick={() => setLocation("/")}
                data-testid={`btn-adopt-${story.species}`}
              >
                <Heart size={14} className="mr-1" />Adopt One
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            <p className="text-sm text-foreground leading-relaxed mb-5">{story.story}</p>
            <div className="rounded-md bg-muted/60 px-4 py-3 mb-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Fun Fact</p>
              <p className="text-sm text-foreground">{story.funFact}</p>
            </div>
            <AdSlot format="rectangle" className="mx-auto" />
          </CardContent>
        </Card>

        <div className="mt-6">
          <h2 className="text-base font-bold text-foreground mb-3" style={{ fontFamily: "Outfit, sans-serif" }}>
            More stories
          </h2>
          <div className="flex flex-col gap-2">
            {STORIES.filter((s) => s.slug !== story.slug).map((s) => (
              <button
                key={s.slug}
                onClick={() => setLocation(`/stories/${s.slug}`)}
                data-testid={`link-story-${s.slug}`}
                className={`flex items-center gap-3 p-3 rounded-md bg-gradient-to-r ${s.gradient} hover-elevate`}
              >
                <span className="text-sm font-bold text-white">{s.name}</span>
                <span className={`text-xs ${s.iconColor} italic ml-auto`}>{s.tagline}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 mb-4">
          <AdSlot format="rectangle" className="mx-auto" />
        </div>
        <Footer />
      </div>
      <BottomTabNav />
    </div>
  );
}

// Stories index — all 5 species with ad between every card
export default function Stories() {
  usePageMeta({
    title: "Pet Stories & Lore",
    description: "Read the origin stories of ToyPetMe's 5 magical pet species — Mystic Cat, Star Pup, Fire Drake, Moon Bunny, and Crystal Axolotl. Discover their ancient lore!",
    canonicalPath: "/stories",
  });
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 pb-40">
      <GameHeader />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={20} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "Outfit, sans-serif" }}>
              Pet Lore
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Discover the ancient stories of every species in ToyPetMe.
          </p>
        </div>

        <AdSlot format="banner" className="mx-auto mb-5" />

        <div className="flex flex-col gap-5">
          {STORIES.map((story, idx) => (
            <div key={story.slug}>
              {/* In-content ad after every 2nd card (approved frequency) */}
              {idx > 0 && idx % 2 === 0 && (
                <InContentAd format="rectangle" />
              )}

              <Card className="overflow-hidden" data-testid={`story-card-${story.species}`}>
                <div className={`bg-gradient-to-r ${story.gradient} p-5`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {story.name}
                      </h2>
                      <p className={`text-sm font-medium ${story.iconColor} italic`}>"{story.tagline}"</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="default"
                        variant="outline"
                        className="bg-white/10 text-white border-white/30 font-semibold"
                        onClick={() => setLocation(`/stories/${story.slug}`)}
                        data-testid={`btn-read-${story.species}`}
                      >
                        Read Story
                      </Button>
                      <Button
                        size="default"
                        variant="outline"
                        className="bg-white/15 text-white border-white/30 font-semibold"
                        onClick={() => setLocation("/")}
                        data-testid={`btn-adopt-${story.species}`}
                      >
                        <Heart size={14} className="mr-1" />Adopt
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-5">
                  <p className="text-sm text-foreground leading-relaxed line-clamp-3 mb-3">{story.story}</p>
                  <button
                    onClick={() => setLocation(`/stories/${story.slug}`)}
                    data-testid={`link-fullstory-${story.species}`}
                    className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                  >
                    Read full story →
                  </button>
                  <div className="rounded-md bg-muted/60 px-4 py-3 mt-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">Fun Fact</p>
                    <p className="text-sm text-foreground">{story.funFact}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-8 mb-4">
          <AdSlot format="rectangle" className="mx-auto" />
        </div>

        <Card className="p-6 text-center mb-4">
          <h3 className="text-lg font-bold text-foreground mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
            Ready to raise your own legend?
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Every pet in ToyPetMe has a unique story. Start yours today — no sign-up needed.
          </p>
          <Button size="default" onClick={() => setLocation("/")} data-testid="btn-stories-cta">
            Start Playing Free
          </Button>
        </Card>

        <Footer />
      </div>
      <BottomTabNav />
    </div>
  );
}
