import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const useSeo = ({ title, description, image, type = 'website', noIndex = false }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = title ? `${title} | MovieHub` : 'MovieHub | Film ve Dizi Dünyası';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || 'En güncel film ve dizi bilgileri, oyuncu kadroları, yorumlar ve daha fazlası');
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    const ogImage = document.querySelector('meta[property="og:image"]');
    const ogType = document.querySelector('meta[property="og:type"]');

    if (ogTitle) ogTitle.setAttribute('content', title || 'MovieHub | Film ve Dizi Dünyası');
    if (ogDescription) ogDescription.setAttribute('content', description || 'En güncel film ve dizi bilgileri, oyuncu kadroları, yorumlar ve daha fazlası');
    if (ogUrl) ogUrl.setAttribute('content', window.location.href);
    if (ogImage) ogImage.setAttribute('content', image || `${window.location.origin}/og-image.jpg`);
    if (ogType) ogType.setAttribute('content', type);

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    const twitterImage = document.querySelector('meta[name="twitter:image"]');

    if (twitterTitle) twitterTitle.setAttribute('content', title || 'MovieHub | Film ve Dizi Dünyası');
    if (twitterDescription) twitterDescription.setAttribute('content', description || 'En güncel film ve dizi bilgileri, oyuncu kadroları, yorumlar ve daha fazlası');
    if (twitterImage) twitterImage.setAttribute('content', image || `${window.location.origin}/twitter-image.jpg`);

    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', noIndex ? 'noindex, nofollow' : 'index, follow');
    }

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);

    return () => {
      document.title = 'MovieHub | Film ve Dizi Dünyası';
      if (metaDescription) metaDescription.setAttribute('content', 'En güncel film ve dizi bilgileri, oyuncu kadroları, yorumlar ve daha fazlası');
      if (ogTitle) ogTitle.setAttribute('content', 'MovieHub | Film ve Dizi Dünyası');
      if (ogDescription) ogDescription.setAttribute('content', 'En güncel film ve dizi bilgileri, oyuncu kadroları, yorumlar ve daha fazlası');
      if (ogUrl) ogUrl.setAttribute('content', window.location.origin);
      if (ogImage) ogImage.setAttribute('content', `${window.location.origin}/og-image.jpg`);
      if (ogType) ogType.setAttribute('content', 'website');
      if (twitterTitle) twitterTitle.setAttribute('content', 'MovieHub | Film ve Dizi Dünyası');
      if (twitterDescription) twitterDescription.setAttribute('content', 'En güncel film ve dizi bilgileri, oyuncu kadroları, yorumlar ve daha fazlası');
      if (twitterImage) twitterImage.setAttribute('content', `${window.location.origin}/twitter-image.jpg`);
      if (robotsMeta) robotsMeta.setAttribute('content', 'index, follow');
    };
  }, [title, description, image, type, noIndex, pathname]);
};

export default useSeo;
