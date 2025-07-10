import { useEffect } from 'react';

function SEOHead({ 
  title = "BnS - Premium Luxury E-commerce | Designer Fashion & Lifestyle",
  description = "Discover BnS - Your premier destination for luxury fashion, designer accessories, and premium lifestyle products. Shop exclusive collections with worldwide shipping and exceptional customer service.",
  keywords = "luxury fashion, designer clothing, premium accessories, BnS store, luxury shopping, designer brands, high-end fashion, luxury lifestyle, premium products, exclusive collections",
  image = "/logo.svg",
  url = "https://bns-store.com"
}) {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);
    
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', url);
    
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute('content', image);
    
    // Update Twitter tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.setAttribute('content', title);
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.setAttribute('content', description);
    
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute('content', image);
    
  }, [title, description, keywords, image, url]);

  return null; // This component doesn't render anything
}

export default SEOHead;
