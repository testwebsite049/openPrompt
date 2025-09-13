export interface Prompt {
  id: number;
  title: string;
  prompt: string;
  category: string;
  image_url: string;
  tags: string[];
  popularity: number;
  isPortrait?: boolean;
}

export const promptsData: Prompt[] = [
  {
    id: 1,
    title: "Ethereal Portrait",
    prompt: "Portrait of a mystical woman with flowing hair, ethereal lighting, fantasy art style, highly detailed, 4K resolution, soft focus, dreamy atmosphere",
    category: "Portrait",
    image_url: "https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    tags: ["portrait", "fantasy", "ethereal", "mystical"],
    popularity: 95,
    isPortrait: true
  },
  {
    id: 2,
    title: "Cyberpunk Cityscape",
    prompt: "Futuristic cyberpunk city at night, neon lights, rain-soaked streets, blade runner aesthetic, cinematic composition, moody lighting, urban dystopia",
    category: "Landscape",
    image_url: "https://images.pexels.com/photos/2387793/pexels-photo-2387793.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["cyberpunk", "city", "neon", "futuristic"],
    popularity: 87
  },
  {
    id: 3,
    title: "Abstract Geometry",
    prompt: "Abstract geometric patterns, minimalist design, clean composition, monochromatic color scheme, modern art style, high contrast, sharp edges",
    category: "Abstract",
    image_url: "https://images.pexels.com/photos/1323550/pexels-photo-1323550.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
    tags: ["abstract", "geometric", "minimalist", "modern"],
    popularity: 78,
    isPortrait: true
  },
  {
    id: 4,
    title: "Majestic Lion",
    prompt: "Majestic lion in golden hour lighting, wildlife photography style, shallow depth of field, natural habitat, powerful gaze, professional photography",
    category: "Animals",
    image_url: "https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    tags: ["lion", "wildlife", "golden hour", "photography"],
    popularity: 92,
    isPortrait: true
  },
  {
    id: 5,
    title: "Modern Architecture",
    prompt: "Modern architectural marvel, glass and steel construction, urban environment, clean lines, contemporary design, architectural photography, blue hour lighting",
    category: "Architecture",
    image_url: "https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["architecture", "modern", "glass", "urban"],
    popularity: 83
  },
  {
    id: 6,
    title: "Vintage Aesthetic",
    prompt: "Vintage retro aesthetic, warm tones, nostalgic atmosphere, film grain texture, 1970s style, analog photography, soft lighting, muted colors",
    category: "Vintage",
    image_url: "https://images.pexels.com/photos/1624496/pexels-photo-1624496.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
    tags: ["vintage", "retro", "nostalgic", "film"],
    popularity: 76,
    isPortrait: true
  },
  {
    id: 7,
    title: "Ocean Waves",
    prompt: "Dramatic ocean waves crashing against rocky cliffs, stormy weather, dynamic water movement, seascape photography, moody sky, natural power",
    category: "Landscape",
    image_url: "https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["ocean", "waves", "dramatic", "seascape"],
    popularity: 89
  },
  {
    id: 8,
    title: "Forest Portrait",
    prompt: "Portrait in enchanted forest setting, dappled sunlight through trees, natural lighting, fairy tale atmosphere, magical realism, soft focus background",
    category: "Portrait",
    image_url: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    tags: ["portrait", "forest", "natural", "magical"],
    popularity: 91,
    isPortrait: true
  },
  {
    id: 9,
    title: "Space Nebula",
    prompt: "Colorful space nebula, cosmic dust clouds, distant stars, deep space photography, astronomical art, vibrant colors, infinite universe",
    category: "Sci-Fi",
    image_url: "https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["space", "nebula", "cosmic", "astronomy"],
    popularity: 85
  },
  {
    id: 10,
    title: "Minimalist Interior",
    prompt: "Minimalist interior design, clean white walls, natural lighting, Scandinavian style, simple furniture, uncluttered space, modern living",
    category: "Architecture",
    image_url: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
    tags: ["minimalist", "interior", "scandinavian", "clean"],
    popularity: 79,
    isPortrait: true
  },
  {
    id: 11,
    title: "Street Art",
    prompt: "Vibrant street art mural, urban graffiti style, colorful spray paint, artistic expression, city wall, contemporary street culture, bold graphics",
    category: "Abstract",
    image_url: "https://images.pexels.com/photos/1194420/pexels-photo-1194420.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    tags: ["street art", "graffiti", "urban", "colorful"],
    popularity: 82,
    isPortrait: true
  },
  {
    id: 12,
    title: "Mountain Landscape",
    prompt: "Majestic mountain landscape at sunrise, golden light on peaks, misty valleys, panoramic view, nature photography, serene atmosphere, alpine scenery",
    category: "Landscape",
    image_url: "https://images.pexels.com/photos/1366630/pexels-photo-1366630.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["mountains", "sunrise", "landscape", "nature"],
    popularity: 94
  },
  {
    id: 13,
    title: "Fashion Portrait",
    prompt: "High fashion portrait, studio lighting, elegant pose, designer clothing, professional model, beauty photography, dramatic shadows, luxury aesthetic",
    category: "Portrait",
    image_url: "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    tags: ["fashion", "portrait", "studio", "elegant"],
    popularity: 88,
    isPortrait: true
  },
  {
    id: 14,
    title: "Tropical Paradise",
    prompt: "Tropical beach paradise, crystal clear water, white sand, palm trees, turquoise ocean, vacation destination, sunny day, peaceful atmosphere",
    category: "Landscape",
    image_url: "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
    tags: ["tropical", "beach", "paradise", "ocean"],
    popularity: 90
  },
  {
    id: 15,
    title: "Urban Night",
    prompt: "Urban night scene, city lights, busy street, neon signs, metropolitan atmosphere, street photography, motion blur, vibrant nightlife",
    category: "Landscape",
    image_url: "https://images.pexels.com/photos/1486222/pexels-photo-1486222.jpeg?auto=compress&cs=tinysrgb&w=400&h=500&fit=crop",
    tags: ["urban", "night", "city", "neon"],
    popularity: 86,
    isPortrait: true
  },
  {
    id: 16,
    title: "Butterfly Close-up",
    prompt: "Macro photography of butterfly on flower, detailed wings, vibrant colors, shallow depth of field, nature close-up, delicate beauty, spring garden",
    category: "Animals",
    image_url: "https://images.pexels.com/photos/326055/pexels-photo-326055.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&fit=crop",
    tags: ["butterfly", "macro", "nature", "colorful"],
    popularity: 81,
    isPortrait: true
  }
];

export const categories = [
  "All",
  "Portrait",
  "Landscape", 
  "Abstract",
  "Animals",
  "Architecture",
  "Vintage",
  "Sci-Fi"
];

export const sortOptions = [
  { value: "popular", label: "Popular" },
  { value: "recent", label: "Recent" },
  { value: "trending", label: "Trending" },
  { value: "alphabetical", label: "A-Z" }
];