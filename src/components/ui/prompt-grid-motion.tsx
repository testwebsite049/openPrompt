import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { cn } from "@/utils/cn"

interface PromptGridMotionProps {
  /**
   * Array of prompt items to display in the grid
   */
  items?: Array<{
    id: number
    src: string
    prompt: string
    category: string
  }>
  /**
   * Color for the radial gradient background
   */
  gradientColor?: string
  /**
   * Additional CSS classes
   */
  className?: string
}

export function PromptGridMotion({
  items = [],
  gradientColor = 'rgba(0, 0, 0, 0.1)',
  className
}: PromptGridMotionProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<(HTMLDivElement | null)[]>([])
  const mouseXRef = useRef(window.innerWidth / 2)

  // Create default items if none provided (4 rows × 3 columns = 12 items)
  const defaultItems = Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    src: `https://images.unsplash.com/photo-${1500000000000 + index}?w=400&h=300&fit=crop&auto=format`,
    prompt: `Amazing AI prompt ${index + 1}`,
    category: ['Portrait', 'Landscape', 'Abstract', 'Animals', 'Architecture', 'Vintage'][index % 6]
  }))

  const combinedItems = items.length > 0 ? items.slice(0, 12) : defaultItems

  useEffect(() => {
    gsap.ticker.lagSmoothing(0)

    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = e.clientX
    }

    const updateMotion = () => {
      const maxMoveAmount = 200
      const baseDuration = 0.8
      const inertiaFactors = [0.6, 0.4, 0.3, 0.2]

      rowRefs.current.forEach((row, index) => {
        if (row) {
          const direction = index % 2 === 0 ? 1 : -1
          const moveAmount = ((mouseXRef.current / window.innerWidth) * maxMoveAmount - maxMoveAmount / 2) * direction

          gsap.to(row, {
            x: moveAmount,
            duration: baseDuration + inertiaFactors[index % inertiaFactors.length],
            ease: 'power3.out',
            overwrite: 'auto',
          })
        }
      })
    }

    const removeAnimationLoop = gsap.ticker.add(updateMotion)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      removeAnimationLoop()
    }
  }, [])

  return (
    <div className={cn("h-full w-full overflow-hidden", className)} ref={gridRef}>
      <section
        className="relative flex h-[100vh] w-full items-center justify-center overflow-hidden"
        style={{
          background: `radial-gradient(circle, ${gradientColor} 0%, transparent 70%)`,
        }}
      >
        <div className="relative z-2 flex-none grid h-[140vh] w-[140vw] gap-4 grid-rows-[repeat(4,1fr)] grid-cols-[100%] -rotate-12 origin-center">
          {[...Array(4)].map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="grid gap-4 grid-cols-[repeat(3,1fr)] will-change-transform will-change-filter"
              ref={(el) => (rowRefs.current[rowIndex] = el)}
            >
              {[...Array(3)].map((_, itemIndex) => {
                const item = combinedItems[rowIndex * 3 + itemIndex]
                if (!item) return null
                
                return (
                  <div key={itemIndex} className="relative group">
                    <div className="relative h-full w-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group-hover:scale-105">
                      <img
                        src={item.src}
                        alt={item.prompt}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-3 left-3 right-3">
                          <span className="inline-block px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium text-white border border-white/30 mb-2">
                            {item.category}
                          </span>
                          <p className="text-white text-xs font-mono leading-relaxed line-clamp-2">
                            "{item.prompt}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
