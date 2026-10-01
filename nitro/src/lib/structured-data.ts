/**
 * Structured data carried over verbatim from the certified site (inline JSON-LD per page, plus
 * schema/services.json, which the certified site injected client-side via schema.js and is now rendered
 * server-side). Generated once from main @ f7ec08a; edit facts in lockstep with src/lib/site.ts.
 */
export const STRUCTURED_DATA: Record<string, unknown[]> = {
  "/": [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": [
            "LocalBusiness",
            "ProfessionalService"
          ],
          "@id": "https://www.forge-ct.com/#business",
          "name": "FORGE CT",
          "url": "https://www.forge-ct.com/",
          "image": "https://www.forge-ct.com/images/og-image.jpg",
          "description": "Custom websites and web systems for local retailers, restaurants, specialty shops, and other small businesses around Greater Hartford.",
          "email": "create@forge-ct.com",
          "priceRange": "$750 to $2,500+",
          "founder": {
            "@type": "Person",
            "name": "Nick Sousa"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Farmington",
            "addressRegion": "CT",
            "addressCountry": "US"
          },
          "areaServed": {
            "@type": "City",
            "name": "Greater Hartford"
          },
          "offers": [
            {
              "@type": "Offer",
              "name": "Basic — Starter Website",
              "price": "750",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Basic — Starter Website",
                "description": "Up to 3 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; 1 revision."
              }
            },
            {
              "@type": "Offer",
              "name": "Standard — Business Website",
              "price": "1500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Standard — Business Website",
                "description": "Up to 5 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; speed and performance optimization; 2 revisions."
              }
            },
            {
              "@type": "Offer",
              "name": "Premium — Forge Website",
              "price": "2500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Premium — Forge Website",
                "description": "Up to 8 pages; custom design and development; responsive, mobile-first functional website; advanced functionality; hosting setup; social media icons; speed and performance optimization; 3 revisions. E-commerce is a paid add-on."
              }
            },
            {
              "@type": "Offer",
              "name": "Care",
              "url": "https://www.forge-ct.com/care",
              "price": "35",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "35",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care",
                "description": "Changes within 2 business days. First month free on every build. Cancel anytime."
              }
            },
            {
              "@type": "Offer",
              "name": "Care+",
              "url": "https://www.forge-ct.com/care",
              "price": "79",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "79",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care+",
                "description": "Everything in Care plus one extra block or small page change a month. Same or next business day."
              }
            }
          ]
        }
      ]
    }
  ],
  "/audit": [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": "Forge-CT Audit",
      "serviceType": "Website audit for local businesses",
      "provider": {
        "@type": "ProfessionalService",
        "name": "FORGE CT",
        "areaServed": "Greater Hartford, Connecticut"
      },
      "description": "A free review of a local business website: what a customer sees before they walk in, what is getting lost, and three practical fixes within 24 hours.",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  ],
  "/care": [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfessionalService",
          "@id": "https://www.forge-ct.com/#business",
          "name": "FORGE CT",
          "url": "https://www.forge-ct.com/",
          "email": "create@forge-ct.com",
          "description": "Custom websites and web systems for small businesses, local retailers, restaurants, specialty shops, and other local businesses. Custom functionality and larger builds are scoped separately.",
          "priceRange": "$750 to $2,500+",
          "founder": {
            "@type": "Person",
            "name": "Nick Sousa"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Farmington",
            "addressRegion": "CT",
            "addressCountry": "US"
          },
          "hasOfferCatalog": {
            "@id": "https://www.forge-ct.com/services#catalog"
          }
        },
        {
          "@type": "OfferCatalog",
          "@id": "https://www.forge-ct.com/services#catalog",
          "name": "FORGE CT website packages and add-ons",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "Basic — Starter Website",
              "price": "750",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Basic — Starter Website",
                "description": "Up to 3 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; 1 revision."
              }
            },
            {
              "@type": "Offer",
              "name": "Standard — Business Website",
              "price": "1500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Standard — Business Website",
                "description": "Up to 5 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; speed and performance optimization; 2 revisions."
              }
            },
            {
              "@type": "Offer",
              "name": "Premium — Forge Website",
              "price": "2500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Premium — Forge Website",
                "description": "Up to 8 pages; custom design and development; responsive, mobile-first functional website; advanced functionality; hosting setup; social media icons; speed and performance optimization; 3 revisions. E-commerce is a paid add-on."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Basic",
              "price": "250",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Basic package scope",
                "description": "1-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Standard",
              "price": "500",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Standard package scope",
                "description": "3-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Premium",
              "price": "750",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Premium package scope",
                "description": "5-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional page",
              "price": "150",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One additional page",
                "description": "Adds 1 day."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional revision",
              "price": "100",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One additional revision",
                "description": "Adds 1 day."
              }
            },
            {
              "@type": "Offer",
              "name": "E-commerce functionality add-on",
              "price": "750",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "E-commerce functionality for an otherwise applicable package",
                "description": "Adds 5 days; exact product, catalog, integration, and custom-functionality scope is agreed separately."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional product",
              "price": "250",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One defined additional product build",
                "description": "Adds 2 days. Not unlimited product uploads or simple data entry; broader system requirements are scoped separately."
              }
            },
            {
              "@type": "Offer",
              "name": "Care",
              "url": "https://www.forge-ct.com/care",
              "price": "35",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "35",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care",
                "serviceType": "Website care plan",
                "description": "Hours, events, and restocks stay current. Changes within 2 business days. Cancel anytime."
              }
            },
            {
              "@type": "Offer",
              "name": "Care+",
              "url": "https://www.forge-ct.com/care",
              "price": "79",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "79",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care+",
                "serviceType": "Website care plan",
                "description": "Care plus one extra monthly change. Same or next business day."
              }
            }
          ]
        }
      ]
    }
  ],
  "/connecticut-web-design": [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": [
            "LocalBusiness",
            "ProfessionalService"
          ],
          "@id": "https://www.forge-ct.com/#business",
          "name": "FORGE CT",
          "url": "https://www.forge-ct.com/",
          "image": "https://www.forge-ct.com/images/og-image.jpg",
          "description": "Connecticut web design and development for local businesses, retail shops, and real-world customer experiences.",
          "email": "create@forge-ct.com",
          "priceRange": "$750 to $2,500+",
          "founder": {
            "@type": "Person",
            "name": "Nick Sousa"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Farmington",
            "addressRegion": "CT",
            "addressCountry": "US"
          },
          "areaServed": {
            "@type": "State",
            "name": "Connecticut"
          }
        },
        {
          "@type": "WebPage",
          "@id": "https://www.forge-ct.com/connecticut-web-design#webpage",
          "url": "https://www.forge-ct.com/connecticut-web-design",
          "name": "Connecticut Web Design for Local Businesses",
          "about": {
            "@id": "https://www.forge-ct.com/#business"
          }
        }
      ]
    }
  ],
  "/hartford-web-design": [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much does a shop website cost in Hartford?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Basic is $750 for up to 3 pages, Standard is $1,500 for up to 5 pages, and Premium is $2,500 for up to 8 pages. Hosting setup is included in all three packages. E-commerce is a paid add-on; larger custom builds are scoped separately. Care is $35 a month."
          }
        },
        {
          "@type": "Question",
          "name": "What does a card shop website need?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A useful card shop website makes hours, location, directions, events, collections, services, and the next step easy to find from a phone. FORGE CT builds around the customer visit, not a generic brochure."
          }
        },
        {
          "@type": "Question",
          "name": "Do you work with shops outside Hartford?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "FORGE CT is based in Farmington and works with shops across Greater Hartford and Connecticut. Send your URL to start with three practical website fixes within 24 hours."
          }
        },
        {
          "@type": "Question",
          "name": "What is the first step?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Send your shop URL and a little context about what feels stuck. FORGE CT will review it like a customer and reply with three practical fixes within 24 hours."
          }
        }
      ]
    },
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfessionalService",
          "@id": "https://www.forge-ct.com/#business",
          "name": "FORGE CT",
          "url": "https://www.forge-ct.com/",
          "email": "create@forge-ct.com",
          "description": "Custom websites and web systems for small businesses, local retailers, restaurants, specialty shops, and other local businesses. Custom functionality and larger builds are scoped separately.",
          "priceRange": "$750 to $2,500+",
          "founder": {
            "@type": "Person",
            "name": "Nick Sousa"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Farmington",
            "addressRegion": "CT",
            "addressCountry": "US"
          },
          "hasOfferCatalog": {
            "@id": "https://www.forge-ct.com/services#catalog"
          }
        },
        {
          "@type": "OfferCatalog",
          "@id": "https://www.forge-ct.com/services#catalog",
          "name": "FORGE CT website packages and add-ons",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "Basic — Starter Website",
              "price": "750",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Basic — Starter Website",
                "description": "Up to 3 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; 1 revision."
              }
            },
            {
              "@type": "Offer",
              "name": "Standard — Business Website",
              "price": "1500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Standard — Business Website",
                "description": "Up to 5 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; speed and performance optimization; 2 revisions."
              }
            },
            {
              "@type": "Offer",
              "name": "Premium — Forge Website",
              "price": "2500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Premium — Forge Website",
                "description": "Up to 8 pages; custom design and development; responsive, mobile-first functional website; advanced functionality; hosting setup; social media icons; speed and performance optimization; 3 revisions. E-commerce is a paid add-on."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Basic",
              "price": "250",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Basic package scope",
                "description": "1-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Standard",
              "price": "500",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Standard package scope",
                "description": "3-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Premium",
              "price": "750",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Premium package scope",
                "description": "5-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional page",
              "price": "150",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One additional page",
                "description": "Adds 1 day."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional revision",
              "price": "100",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One additional revision",
                "description": "Adds 1 day."
              }
            },
            {
              "@type": "Offer",
              "name": "E-commerce functionality add-on",
              "price": "750",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "E-commerce functionality for an otherwise applicable package",
                "description": "Adds 5 days; exact product, catalog, integration, and custom-functionality scope is agreed separately."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional product",
              "price": "250",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One defined additional product build",
                "description": "Adds 2 days. Not unlimited product uploads or simple data entry; broader system requirements are scoped separately."
              }
            },
            {
              "@type": "Offer",
              "name": "Care",
              "url": "https://www.forge-ct.com/care",
              "price": "35",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "35",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care",
                "serviceType": "Website care plan",
                "description": "Hours, events, and restocks stay current. Changes within 2 business days. Cancel anytime."
              }
            },
            {
              "@type": "Offer",
              "name": "Care+",
              "url": "https://www.forge-ct.com/care",
              "price": "79",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "79",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care+",
                "serviceType": "Website care plan",
                "description": "Care plus one extra monthly change. Same or next business day."
              }
            }
          ]
        }
      ]
    }
  ],
  "/services": [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfessionalService",
          "@id": "https://www.forge-ct.com/#business",
          "name": "FORGE CT",
          "url": "https://www.forge-ct.com/",
          "email": "create@forge-ct.com",
          "description": "Custom websites and web systems for small businesses, local retailers, restaurants, specialty shops, and other local businesses. Custom functionality and larger builds are scoped separately.",
          "priceRange": "$750 to $2,500+",
          "founder": {
            "@type": "Person",
            "name": "Nick Sousa"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Farmington",
            "addressRegion": "CT",
            "addressCountry": "US"
          },
          "hasOfferCatalog": {
            "@id": "https://www.forge-ct.com/services#catalog"
          }
        },
        {
          "@type": "OfferCatalog",
          "@id": "https://www.forge-ct.com/services#catalog",
          "name": "FORGE CT website packages and add-ons",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "Basic — Starter Website",
              "price": "750",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Basic — Starter Website",
                "description": "Up to 3 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; 1 revision."
              }
            },
            {
              "@type": "Offer",
              "name": "Standard — Business Website",
              "price": "1500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Standard — Business Website",
                "description": "Up to 5 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; speed and performance optimization; 2 revisions."
              }
            },
            {
              "@type": "Offer",
              "name": "Premium — Forge Website",
              "price": "2500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Premium — Forge Website",
                "description": "Up to 8 pages; custom design and development; responsive, mobile-first functional website; advanced functionality; hosting setup; social media icons; speed and performance optimization; 3 revisions. E-commerce is a paid add-on."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Basic",
              "price": "250",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Basic package scope",
                "description": "1-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Standard",
              "price": "500",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Standard package scope",
                "description": "3-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Premium",
              "price": "750",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Premium package scope",
                "description": "5-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional page",
              "price": "150",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One additional page",
                "description": "Adds 1 day."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional revision",
              "price": "100",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One additional revision",
                "description": "Adds 1 day."
              }
            },
            {
              "@type": "Offer",
              "name": "E-commerce functionality add-on",
              "price": "750",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "E-commerce functionality for an otherwise applicable package",
                "description": "Adds 5 days; exact product, catalog, integration, and custom-functionality scope is agreed separately."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional product",
              "price": "250",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One defined additional product build",
                "description": "Adds 2 days. Not unlimited product uploads or simple data entry; broader system requirements are scoped separately."
              }
            },
            {
              "@type": "Offer",
              "name": "Care",
              "url": "https://www.forge-ct.com/care",
              "price": "35",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "35",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care",
                "serviceType": "Website care plan",
                "description": "Hours, events, and restocks stay current. Changes within 2 business days. Cancel anytime."
              }
            },
            {
              "@type": "Offer",
              "name": "Care+",
              "url": "https://www.forge-ct.com/care",
              "price": "79",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "79",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care+",
                "serviceType": "Website care plan",
                "description": "Care plus one extra monthly change. Same or next business day."
              }
            }
          ]
        }
      ]
    }
  ],
  "/why": [
    {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "ProfessionalService",
          "@id": "https://www.forge-ct.com/#business",
          "name": "FORGE CT",
          "url": "https://www.forge-ct.com/",
          "email": "create@forge-ct.com",
          "description": "Custom websites and web systems for small businesses, local retailers, restaurants, specialty shops, and other local businesses. Custom functionality and larger builds are scoped separately.",
          "priceRange": "$750 to $2,500+",
          "founder": {
            "@type": "Person",
            "name": "Nick Sousa"
          },
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Farmington",
            "addressRegion": "CT",
            "addressCountry": "US"
          },
          "hasOfferCatalog": {
            "@id": "https://www.forge-ct.com/services#catalog"
          }
        },
        {
          "@type": "OfferCatalog",
          "@id": "https://www.forge-ct.com/services#catalog",
          "name": "FORGE CT website packages and add-ons",
          "itemListElement": [
            {
              "@type": "Offer",
              "name": "Basic — Starter Website",
              "price": "750",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Basic — Starter Website",
                "description": "Up to 3 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; 1 revision."
              }
            },
            {
              "@type": "Offer",
              "name": "Standard — Business Website",
              "price": "1500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Standard — Business Website",
                "description": "Up to 5 pages; custom design and development; responsive, mobile-first functional website; hosting setup; social media icons; speed and performance optimization; 2 revisions."
              }
            },
            {
              "@type": "Offer",
              "name": "Premium — Forge Website",
              "price": "2500",
              "priceCurrency": "USD",
              "url": "https://www.forge-ct.com/services",
              "itemOffered": {
                "@type": "Service",
                "name": "Premium — Forge Website",
                "description": "Up to 8 pages; custom design and development; responsive, mobile-first functional website; advanced functionality; hosting setup; social media icons; speed and performance optimization; 3 revisions. E-commerce is a paid add-on."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Basic",
              "price": "250",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Basic package scope",
                "description": "1-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Standard",
              "price": "500",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Standard package scope",
                "description": "3-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Extra-fast delivery — Premium",
              "price": "750",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "Extra-fast delivery for the defined Premium package scope",
                "description": "5-day delivery."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional page",
              "price": "150",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One additional page",
                "description": "Adds 1 day."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional revision",
              "price": "100",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One additional revision",
                "description": "Adds 1 day."
              }
            },
            {
              "@type": "Offer",
              "name": "E-commerce functionality add-on",
              "price": "750",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "E-commerce functionality for an otherwise applicable package",
                "description": "Adds 5 days; exact product, catalog, integration, and custom-functionality scope is agreed separately."
              }
            },
            {
              "@type": "Offer",
              "name": "Additional product",
              "price": "250",
              "priceCurrency": "USD",
              "itemOffered": {
                "@type": "Service",
                "name": "One defined additional product build",
                "description": "Adds 2 days. Not unlimited product uploads or simple data entry; broader system requirements are scoped separately."
              }
            },
            {
              "@type": "Offer",
              "name": "Care",
              "url": "https://www.forge-ct.com/care",
              "price": "35",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "35",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care",
                "serviceType": "Website care plan",
                "description": "Hours, events, and restocks stay current. Changes within 2 business days. Cancel anytime."
              }
            },
            {
              "@type": "Offer",
              "name": "Care+",
              "url": "https://www.forge-ct.com/care",
              "price": "79",
              "priceCurrency": "USD",
              "priceSpecification": {
                "@type": "UnitPriceSpecification",
                "price": "79",
                "priceCurrency": "USD",
                "unitText": "MONTH"
              },
              "itemOffered": {
                "@type": "Service",
                "name": "Care+",
                "serviceType": "Website care plan",
                "description": "Care plus one extra monthly change. Same or next business day."
              }
            }
          ]
        }
      ]
    }
  ],
  "/work": [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": "https://www.forge-ct.com/work#webpage",
      "url": "https://www.forge-ct.com/work",
      "name": "Forge CT live client projects",
      "description": "All five approved Forge CT live client projects for local shops and businesses.",
      "isPartOf": {
        "@id": "https://www.forge-ct.com/#business"
      },
      "mainEntity": [
        {
          "@type": "CreativeWork",
          "name": "Harris in Wonderland",
          "url": "https://www.forge-ct.com/work/harris-in-wonderland"
        },
        {
          "@type": "CreativeWork",
          "name": "Thousand Sunny Cards and Collectibles",
          "url": "https://www.forge-ct.com/work/thousand-sunny"
        },
        {
          "@type": "CreativeWork",
          "name": "M and J Video Games",
          "url": "https://www.forge-ct.com/work/m-and-j-video-games"
        },
        {
          "@type": "CreativeWork",
          "name": "Hard Hittin Card Shop",
          "url": "https://www.forge-ct.com/work/hard-hittin"
        },
        {
          "@type": "CreativeWork",
          "name": "Infinite Heroes",
          "url": "https://www.forge-ct.com/work/infinite-heroes"
        }
      ]
    }
  ],
  "/work/hard-hittin": [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": "https://www.forge-ct.com/work/hard-hittin#case-study",
      "url": "https://www.forge-ct.com/work/hard-hittin",
      "name": "Hard Hittin Card Shop",
      "description": "Hard Hittin Card Shop: A launch page with the same direct energy as the counter. See the Forge CT case study and live site.",
      "image": "https://www.forge-ct.com/images/work/hardhittin.jpg",
      "creator": {
        "@type": "Organization",
        "name": "FORGE CT",
        "url": "https://www.forge-ct.com/"
      }
    }
  ],
  "/work/harris-in-wonderland": [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": "https://www.forge-ct.com/work/harris-in-wonderland#case-study",
      "url": "https://www.forge-ct.com/work/harris-in-wonderland",
      "name": "Harris in Wonderland",
      "description": "Harris in Wonderland: Live inventory, a feeder locker, care sheets, and a beginner chooser in one experience. See the Forge CT case study and project details.",
      "image": "https://www.forge-ct.com/images/work/harrisinwonderland.jpg",
      "creator": {
        "@type": "Organization",
        "name": "FORGE CT",
        "url": "https://www.forge-ct.com/"
      }
    }
  ],
  "/work/infinite-heroes": [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": "https://www.forge-ct.com/work/infinite-heroes#case-study",
      "url": "https://www.forge-ct.com/work/infinite-heroes",
      "name": "Infinite Heroes",
      "description": "Infinite Heroes: A clear local shop page built around the Wednesday rhythm and the floor. See the Forge CT case study and live site.",
      "image": "https://www.forge-ct.com/images/work/IMG_2604.jpg",
      "creator": {
        "@type": "Organization",
        "name": "FORGE CT",
        "url": "https://www.forge-ct.com/"
      }
    }
  ],
  "/work/m-and-j-video-games": [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": "https://www.forge-ct.com/work/m-and-j-video-games#case-study",
      "url": "https://www.forge-ct.com/work/m-and-j-video-games",
      "name": "M and J Video Games",
      "description": "M and J Video Games: A neighborhood storefront online, built for the phone check from the parking lot. See the Forge CT case study and live site.",
      "image": "https://www.forge-ct.com/images/work/mjvideogames.jpg",
      "creator": {
        "@type": "Organization",
        "name": "FORGE CT",
        "url": "https://www.forge-ct.com/"
      }
    }
  ],
  "/work/thousand-sunny": [
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "@id": "https://www.forge-ct.com/work/thousand-sunny#case-study",
      "url": "https://www.forge-ct.com/work/thousand-sunny",
      "name": "Thousand Sunny Cards and Collectibles",
      "description": "Thousand Sunny Cards and Collectibles: A shop page with event context and custom illustration that feels like the store. See the Forge CT case study and live site.",
      "image": "https://www.forge-ct.com/images/work/thousandsunny.jpg",
      "creator": {
        "@type": "Organization",
        "name": "FORGE CT",
        "url": "https://www.forge-ct.com/"
      }
    }
  ]
};
