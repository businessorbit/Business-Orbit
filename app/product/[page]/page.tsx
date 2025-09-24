"use client";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";

type PageMapKey = "auth" | "invite" | "onboarding" | "subscription" | "connection";

const pageLoaders: Record<PageMapKey, () => Promise<{ default: React.ComponentType<any> }>> = {
  auth: () => import("../../auth/page"),
  invite: () => import("../../invite/page"),
  onboarding: () => import("../../onboarding/page"),
  subscription: () => import("../../subscription/page"),
  connection: () => import("../../connections/page"),
};

export default function ProductAliasPage({ params }: { params: { page: string } }) {
  const key = params.page as PageMapKey;
  const loader = pageLoaders[key];

  if (!loader) {
    notFound();
  }

  const Component = dynamic(loader, { ssr: false });
  return <Component />;
}


