# Jeroso

**By Wilhem Bruce Cuevas**

## Website Category

E-commerce Website

## Project Description

Jeroso is a luxury wine e-commerce website designed to give users an elegant and immersive wine-browsing experience. Users can explore featured wines, view detailed wine information, save wines to a wishlist, manage a shopping cart, submit an order request, join tasting events, read wine insights, and send inquiries through a contact form.

## Main Features

- One-page homepage with hero, featured wines, tastings, insights, about, and contact sections.
- Animated splash screen with smooth navigation.
- Wine catalog with search, prices, metadata, and responsive wine cards.
- Dynamic wine detail pages at `/wines/[slug]`.
- Wine image galleries, lightbox viewing, tasting details, and wine stories.
- Interactive wine carousel with drag, touch, keyboard, and arrow controls.
- Email/password and Google authentication.
- User registration, login, logout, password reset, and profile management.
- Wishlist stored securely in Firebase Firestore.
- Shopping cart with quantity updates and item removal, stored in Firestore.
- Checkout order-request flow with delivery details, age confirmation, order storage, and processing-confirmation email support through Resend.
- Contact form with validation, topic selection, signed-in email autofill, and Resend email delivery.
- Wine insight flip cards and tasting-event listings.
- Animated contact section with ASCII hands, parallax, and hover effects.
- Custom 404 page.
- Responsive desktop and mobile navigation.
- Accessibility support, keyboard controls, and reduced-motion support.

## Not Yet Included

- Online payment-gateway integration and card or e-wallet payment capture.
- Automated delivery pricing, shipment tracking, and delivery-status notifications.
- Administrative order-management dashboard and inventory management.
- CMS-backed wine, insight, and tasting content management.

> Note: Checkout currently submits an order request and stores it in Firestore; payment is not captured on the website. Wine, insight, and tasting content currently comes from code-based data files. Resend requires a configured API key and verified sender domain to deliver emails to customer addresses.

## Technologies Used

| Area | Technology |
| --- | --- |
| Framework | Next.js 16 App Router |
| UI Library | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4, CSS, CSS Variables |
| Fonts | Inter and Cormorant Garamond |
| Authentication | Firebase Authentication |
| Database | Firebase Firestore |
| Email Service | Resend |
| Animation | GSAP, Motion, CSS Keyframes, Web Animations API |
| Smooth Scrolling | Lenis |
| Graphics | Canvas 2D, OGL/WebGL, vGPU/WebGPU |
| Icons | Lucide React |
| Utilities | clsx, tailwind-merge |
| Tooling | ESLint, TypeScript, PostCSS |

## Project Structure

```text
app/          Main website pages, routes, and route handlers
components/   Reusable UI, layout, feature, and animation components
contexts/     React context providers for authentication, cart, and wishlist state
lib/          Wine, insight, tasting, navigation, Firebase, and utility data modules
public/       Static files and images
firestore.rules Firebase Firestore access rules
package.json  Project dependencies and scripts
```

## Additional Implementation Details

Jeroso uses Next.js Server and Client Components, dynamic routes, Route Handlers, React Context, Firebase security rules, image optimization, URL search parameters, and responsive media queries. It also supports browser events such as click, keyboard, pointer, scroll, and form events to create a more interactive user experience.

## Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
