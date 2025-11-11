"use client";

// Force dynamic rendering to prevent build-time static generation
export const dynamic = 'force-dynamic'
export const dynamicParams = true

import ChapterPage from "../../../chapters/[id]/page";

export default ChapterPage;
