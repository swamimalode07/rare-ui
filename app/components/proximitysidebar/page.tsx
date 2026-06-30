"use client"

import ProximitySidebar from '@/components/ui/proximity-sidebar'
import React from 'react'

const LOREM_A = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const LOREM_B = "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const LOREM_C = "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";


const sections = [
  {
    title: "Introduction",
    blocks: [
      { text: LOREM_A },
      { heading: "Background", text: LOREM_B },
      { heading: "Etymology", text: LOREM_C },
    ],
  },
  {
    title: "History",
    blocks: [
      { text: LOREM_C },
      { heading: "Early period", text: LOREM_A },
      { heading: "Modern era", text: LOREM_B },
    ],
  },
  {
    title: "Overview",
    blocks: [
      { text: LOREM_B },
      { heading: "Principles", text: LOREM_C },
      { heading: "Structure", text: LOREM_A },
    ],
  },
  {
    title: "Architecture",
    blocks: [
      { text: LOREM_A },
      { heading: "Components", text: LOREM_B },
      { heading: "Data flow", text: LOREM_C },
    ],
  },
  {
    title: "References",
    blocks: [{ text: LOREM_C }, { heading: "Further reading", text: LOREM_A }],
  },
];

const ProximitySideBarComponent = () => {
    const heroRef = React.useRef<HTMLDivElement>(null)
    const aboutRef = React.useRef<HTMLDivElement>(null)
    const featuresRef = React.useRef<HTMLDivElement>(null)
    const pricingRef = React.useRef<HTMLDivElement>(null)
    const contactRef = React.useRef<HTMLDivElement>(null)
  
    return (
        <div className="flex flex-row">
            <div className="w-40">
                <ProximitySidebar side="left" sections={[
                    // heroRef,
                    // aboutRef,
                    // featuresRef,
                    // pricingRef,
                    // contactRef,
                ]} />
            </div>
            <div>
                asdf
            </div>
        </div>
    )
}

export default ProximitySideBarComponent