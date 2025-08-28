import { PlusIcon } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"

const faqItems = [
  {
    id: "1",
    title: "What is CodeMesh?",
    content:
      "CodeMesh is a unified web platform for competitive programmers. It brings together contests, profiles, ratings, problem stats, and personalized practice suggestions from multiple major coding sites—all in one place.",
  },
  {
    id: "2",
    title: "Which platforms does CodeMesh support?",
    content:
      "CodeMesh currently supports over 9 popular competitive programming platforms, including Codeforces, CodeChef, LeetCode, AtCoder, GeeksforGeeks, Coding Ninjas (Coding Studio), HackerRank, CSES, and HackerEarth. We're always working to add more based on user demand.",
  },  
  {
    id: "3",
    title: "How does CodeMesh get my data from different platforms?",
    content:
      "With your permission, CodeMesh fetches data using the official public APIs of each platform. You simply need to add your user handles—no passwords are ever required for third-party accounts.",
  },
  {
    id: "4",
    title: "Is my data safe and secure on CodeMesh?",
    content:
      "Absolutely. We use multi-factor authentication (MFA) for your account, end-to-end encryption for all sensitive data, and secure API communication for all platform integrations. Regular security checks and prompt vulnerability fixes ensure your privacy and security.",
  },
  {
    id: "5",
    title: "What is the \"CodeMesh Rating\"?",
    content:
      "The CodeMesh Rating is a proprietary score calculated by combining your performance metrics from all connected platforms. It provides a single, holistic indicator of your competitive programming skill, updated dynamically as you compete and practice.",
  },
  // {
  //   id: "6",
  //   title: "How does the practice recommendation engine work?",
  //   content:
  //     "Our AI-powered engine analyzes your problem-solving history and performance across tags (like DP, Graphs, Strings, etc.), then recommends unsolved problems tailored to your weak areas and suitable difficulty levels—helping you improve faster and smarter.",
  // },
  {
    id: "7",
    title: "Can I get alerts for upcoming contests?",
    content:
      "Yes! You'll get a unified, customizable calendar view of all major contests. Set up instant, email, or in-app notifications—choose when and how you want to be reminded.",
  },
  // {
  //   id: "8",
  //   title: "Do I have to pay to use CodeMesh?",
  //   content:
  //     "CodeMesh is currently free to use for all core features. In the future, some advanced analytics may be part of a premium offering, but the core platform will always stay free for everyone.",
  // },
  // {
  //   id: "9",
  //   title: "What's coming next for CodeMesh?",
  //   content:
  //     "We plan to support more platforms, richer analytics, and advanced features like auto-generated study plans and focused practice tracks as we grow. Your feedback shapes our roadmap!",
  // },
  // {
  //   id: "10",
  //   title: "Who can I contact for feedback or support?",
  //   content:
  //     "We love feedback! You can reach out directly via the \"Contact Us\" section on the site or email our team at support@codemesh.com. We're always happy to help.",
  // },
]

export default function FAQ() {
  return (
    <div 
      className="w-full max-w-4xl mx-auto px-6 py-16"
      style={{
        fontFamily: 'var(--font-sans)',
      }}
    >
      <div className="text-center mb-12">
        <h2 
          className="text-4xl font-bold mb-4"
          style={{
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Frequently Asked Questions
        </h2>
        <p 
          className="text-lg"
          style={{
            color: 'hsl(var(--muted-foreground))',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Everything you need to know about CodeMesh
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-3" defaultValue="1">
        {faqItems.map((item) => (
          <AccordionItem 
            value={item.id} 
            key={item.id} 
            className="border rounded-lg px-6 py-2 transition-all duration-200 hover:shadow-md"
            style={{
              borderColor: 'hsl(var(--border))',
              backgroundColor: 'hsl(var(--card))',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <AccordionPrimitive.Header className="flex">
              <AccordionPrimitive.Trigger 
                className="flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-[16px] leading-6 font-semibold transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0"
                style={{
                  color: 'hsl(var(--foreground))',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {item.title}
                <PlusIcon
                  size={18}
                  className="pointer-events-none shrink-0 transition-transform duration-200"
                  style={{
                    color: 'hsl(var(--primary))',
                  }}
                  aria-hidden="true"
                />
              </AccordionPrimitive.Trigger>
            </AccordionPrimitive.Header>
            <AccordionContent 
              className="pb-4 pr-8 text-[15px] leading-relaxed"
              style={{
                color: 'hsl(var(--muted-foreground))',
                fontFamily: 'var(--font-sans)',
              }}
            >
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* <div 
        className="text-center mt-12 p-6 rounded-lg"
        style={{
          backgroundColor: 'hsl(var(--muted))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <h3 
          className="text-xl font-semibold mb-2"
          style={{
            color: 'hsl(var(--foreground))',
            fontFamily: 'var(--font-sans)',
          }}
        >
          Still have questions?
        </h3>
        <p 
          className="mb-4"
          style={{
            color: 'hsl(var(--muted-foreground))',
            fontFamily: 'var(--font-sans)',
          }}
        >
          We're here to help! Reach out to our support team.
        </p>
        <button 
          className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90"
          style={{
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow)',
          }}
        >
          Contact Support
        </button>
      </div> */}
    </div>
  )
}
