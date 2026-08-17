import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

/*
 * The page arrives prerendered, so React attaches to that markup instead of
 * throwing it away and painting the section again. `hasChildNodes` keeps the
 * dev server — which serves an empty root — on the plain client path.
 */
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, <App />);
} else {
  ReactDOM.createRoot(rootElement).render(<App />);
}
