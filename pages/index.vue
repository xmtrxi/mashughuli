<script setup lang="ts">
// SEO Configuration
const config = useRuntimeConfig();
const siteUrl = config.public.siteUrl || "https://mashughuli.com";

useServerSeoMeta({
  title: "Mashughuli | Connecting Task Requesters with Reliable Runners",
  ogTitle: "Mashughuli | Connecting Task Requesters with Reliable Runners",
  description:
    "Mashughuli connects people who need errands done with reliable runners. Post tasks or earn by completing errands in your area. Fast, reliable, and secure.",
  ogDescription:
    "Mashughuli connects people who need errands done with reliable runners. Post tasks or earn by completing errands in your area. Fast, reliable, and secure.",
  ogImage: `${siteUrl}/images/seo/mashughuli.png`,
  ogUrl: siteUrl,
  ogType: "website",
  ogSiteName: "Mashughuli",
  twitterCard: "summary_large_image",
  twitterTitle: "Mashughuli | Connecting Task Requesters with Reliable Runners",
  twitterDescription:
    "Mashughuli connects people who need errands done with reliable runners. Post tasks or earn by completing errands in your area. Fast, reliable, and secure.",
  twitterImage: `${siteUrl}/images/seo/mashughuli.png`,
  twitterSite: "@mashughuli",
  robots: "index, follow",
  canonical: siteUrl,
  applicationName: "Mashughuli",
  keywords:
    "errands, runners, tasks, delivery, services, Kenya, Nairobi, reliable, fast",
});

// Structured Data for SEO
// useJsonld({
//   '@context': 'https://schema.org',
//   '@type': 'WebSite',
//   name: 'Mashughuli',
//   description: 'Mashughuli connects people who need errands done with reliable runners. Post tasks or earn by completing errands in your area.',
//   url: siteUrl,
//   potentialAction: {
//     '@type': 'SearchAction',
//     target: `${siteUrl}/errands?search={search_term_string}`,
//     'query-input': 'required name=search_term_string'
//   },
//   publisher: {
//     '@type': 'Organization',
//     name: 'Mashughuli',
//     url: siteUrl
//   }
// });
//
// Preload critical resources
useHead({
  link: [
    {
      rel: "preload",
      as: "image",
      href: "/images/hero-bg.jpg",
      media: "(min-width: 768px)",
    },
  ],
});
</script>
<template>
  <div>
    <HomeHeroSection />
    <HomeHowItWorks />
    <ErrandsCategories />
    <HomeWhyChooseUs />
  </div>
</template>
