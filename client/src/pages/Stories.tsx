import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GameHeader from "@/components/GameHeader";
import BottomTabNav from "@/components/BottomTabNav";
import AdSlot from "@/components/AdSlot";
import Footer from "@/components/Footer";
import { BookOpen, Heart } from "lucide-react";

interface StoryData {
  species: string;
  name: string;
  tagline: string;
  gradient: string;
  iconColor: string;
  story: string;
  funFact: string;
}

const STORIES: StoryData[] = [
  {
    species: "cat",
    name: "Mystic Cat",
    tagline: "Born from starlight and midnight",
    gradient: "from-violet-500 to-purple-700",
    iconColor: "text-violet-200",
    story:
      "Long before the moon had a name, there lived a cat who watched the cosmos swirl into existence. Its eyes carry the memory of a thousand galaxies collapsing and blooming again. Mystic Cats do not sleep — they wander between dreams, collecting the whispers of stars that have already gone dark. If yours blinks at you slowly, that is the ancient greeting of a being older than time. Keep it well-fed, keep it happy, and on the rarest nights you might see faint starlight glow from the tips of its fur.",
    funFact: "Mystic Cats purr at a frequency that is said to calm nearby electronics.",
  },
  {
    species: "dog",
    name: "Star Pup",
    tagline: "Woven from comet tails and laughter",
    gradient: "from-yellow-400 to-orange-500",
    iconColor: "text-yellow-100",
    story:
      "Every time a shooting star streaks across the sky and a child forgets to make a wish, the leftover stardust tumbles earthward and becomes a Star Pup. That is why they always look slightly confused — they were meant to be something grander, but they chose joy instead. Star Pups have boundless energy because each one carries a tiny star inside their chest that never fully cools. They love you loudly and without apology. Scientists have tried to measure a Star Pup's tail-wag speed, but the instruments keep overheating.",
    funFact: "A Star Pup's bark, at its highest pitch, briefly appears on radio telescopes as signal noise.",
  },
  {
    species: "dragon",
    name: "Fire Drake",
    tagline: "Ancient fury, infinite potential",
    gradient: "from-red-500 to-rose-700",
    iconColor: "text-red-100",
    story:
      "Fire Drakes hatched before the continents fully separated. Most slept through the age of dinosaurs, the ice age, and several civilizations rising and falling — so they find your daily problems somewhat quaint. That said, they are fiercely loyal to whoever hatches their egg. Each Drake carries a flame inside its belly that burns hotter as it ages, eventually hot enough to forge metals that don't yet have names. Do not be fooled by the egg stage — even then, the Drake inside is already memorizing your face and deciding whether you are worthy.",
    funFact: "A Fire Drake sneeze at full power registers as a small earthquake in a 2 km radius.",
  },
  {
    species: "bunny",
    name: "Moon Bunny",
    tagline: "Racing moonbeams since the first night",
    gradient: "from-sky-400 to-indigo-500",
    iconColor: "text-sky-100",
    story:
      "There is an old legend that says the first Moon Bunny was found hiding inside a crescent moon, using it as a hammock. It tumbled out when the moon waxed full and has been racing ever since. Moon Bunnies can hop between reflections — jump into a puddle on one side of town and emerge from a window reflection across the city. Their long ears are not just for hearing. They also act as antennae, tuning into the emotional frequencies of everyone around them. A Moon Bunny always knows when you are sad before you do.",
    funFact: "Moon Bunnies can cover 200 metres in a single hop if properly motivated by a distant carrot.",
  },
  {
    species: "axolotl",
    name: "Crystal Axolotl",
    tagline: "The rarest light under the deepest sea",
    gradient: "from-cyan-400 to-teal-600",
    iconColor: "text-cyan-100",
    story:
      "Crystal Axolotls were believed to be myths until one surfaced in an underground lake during a rare alignment of three moons. Their bodies are semi-translucent at full maturity, and if you look closely through their sides you can see crystalline structures where other creatures have organs. They do not age normally — a Crystal Axolotl may spend decades as a larva before deciding the time is right. Their gill frills sense magic as easily as they sense water currents. To own one is a sign of extraordinary luck, or perhaps the universe recognizing something special in you.",
    funFact: "Crystal Axolotls can regenerate any part of their body, including parts that were never there to begin with.",
  },
];

export default function Stories() {
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
            <div key={story.species}>
              {/* Ad slot after every 2 cards */}
              {idx > 0 && idx % 2 === 0 && (
                <div className="mb-5">
                  <AdSlot format="rectangle" className="mx-auto" />
                </div>
              )}

              <Card className="overflow-hidden" data-testid={`story-card-${story.species}`}>
                {/* Header gradient */}
                <div className={`bg-gradient-to-r ${story.gradient} p-5`}>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white" style={{ fontFamily: "Outfit, sans-serif" }}>
                        {story.name}
                      </h2>
                      <p className={`text-sm font-medium ${story.iconColor} italic`}>"{story.tagline}"</p>
                    </div>
                    <Button
                      size="default"
                      variant="outline"
                      className="bg-white/15 text-white border-white/30 font-semibold"
                      onClick={() => setLocation("/")}
                      data-testid={`btn-adopt-${story.species}`}
                    >
                      <Heart size={14} className="mr-1" />
                      Adopt One
                    </Button>
                  </div>
                </div>

                <CardContent className="p-5">
                  <p className="text-sm text-foreground leading-relaxed mb-4">{story.story}</p>
                  <div className="rounded-md bg-muted/60 px-4 py-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">
                      Fun Fact
                    </p>
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

        {/* CTA */}
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
