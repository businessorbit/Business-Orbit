"use client";

// Force dynamic rendering to prevent build-time static generation
export const dynamic = 'force-dynamic'
export const dynamicParams = true

import dynamicImport from "next/dynamic";
import { notFound } from "next/navigation";
import { useParams } from "next/navigation";

type PageMapKey =
  | "auth"
  | "invite"
  | "onboarding"
  | "subscription"
  | "connections"
  | "connection"
  | "navigator"
  | "chapters"
  | "groups"
  | "events"
  | "profile"
  | "consultation"
  | "rewards";

const pageLoaders: Record<PageMapKey, () => Promise<{ default: React.ComponentType<any> }>> = {
  auth: () => import("../../product/auth/page"),
  invite: () => import("../../invite/page"),
  onboarding: () => import("../../onboarding/page"),
  subscription: () => import("../../subscription/page"),
  connections: () => import("../../connections/page"),
  connection: () => import("../../connections/page"),
  navigator: () => import("../../navigator/page"),
  chapters: () => import("../../chapters/page"),
  groups: () => import("../../groups/page"),
  events: () => import("../../events/page"),
  profile: () => import("../../profile/page").catch(() => ({ default: () => <div>Loading...</div> })),
  consultation: () => import("../../consultation/page"),
  rewards: () => import("../../rewards/page"),
};

export default function ProductAliasPage() {
  const params = useParams<{ page: string }>();
  const key = (params?.page ?? "") as PageMapKey;
  const loader = pageLoaders[key];

  if (!loader) {
    notFound();
  }

  const Component = dynamicImport(loader, { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center min-h-screen">Loading...</div>
  });
  return <Component />;
}
