import ReactDOM from 'react-dom/client';
import App from './App';
import { loadDictionary } from './i18n/dictionary-loader';
import { localeFromPath } from './i18n/config';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/*
 * The page arrives prerendered, so React attaches to that markup instead of
 * throwing it away and painting the section again. `hasChildNodes` keeps the
 * dev server — which serves an empty root — on the plain client path.
 */
// The URL's complete dictionary arrives before hydration, so localized static
// HTML never flashes English or suspends halfway through the page. Other
// languages are fetched only when selected.
loadDictionary(localeFromPath(window.location.pathname)).then(() => {
  if (rootElement.hasChildNodes()) {
    ReactDOM.hydrateRoot(rootElement, <App />);
  } else {
    ReactDOM.createRoot(rootElement).render(<App />);
  }
}).catch((error) => {
  // A transient chunk failure leaves the complete prerendered page readable.
  // Reload retries the request; errors do not become unhandled rejections.
  console.error('Unable to initialize the portfolio language. Reload to retry.', error);
});
