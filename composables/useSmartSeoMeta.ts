type KnownSeoMeta = {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  robots?: string;
};

type MetaSource = KnownSeoMeta | Ref<KnownSeoMeta> | ComputedRef<KnownSeoMeta>;

export function useSmartSeoMeta(meta: MetaSource) {
  const resolved = () =>
    (typeof meta === "function" || "value" in meta ? meta.value : meta) ?? {};

  useServerSeoMeta(() => resolved());

  useSeoMeta(() => resolved());
}
