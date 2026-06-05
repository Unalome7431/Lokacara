# Lokacara: Frontend Architecture & Design System Guide

**Project Context:** Lokacara is a community event management platform tailored for the Indonesian market. This document serves as the strict rulebook for implementing the web application interface.

---

## 1. Architecture & Tech Stack
* **Web Framework:** React (Functional Components, Hooks) within a Laravel Starter Kit utilizing **Inertia.js**.
* **Styling:** Tailwind CSS.
* **Backend Setup:** A single shared Laravel backend/database serving both web and mobile.
* **API Protocol:** Refer strictly to `docs/API_DOCUMENTATION.md` for payload structures, expected responses, and endpoint URLs.
* **File Storage Rule:** All files (posters, avatars, QR codes, E-certificates) MUST be stored locally in `storage/app/private/<folderName>`. They are not publicly accessible via symlinks.

---

## 2. UI/UX Design System

The platform utilizes a **Modern Minimalist** design language. The interface minimizes cognitive load and guides the user's attention seamlessly toward key actions using generous whitespace, soft geometric boundaries, and high-contrast elements.

You will be provided with:
*   Design mockups (e.g., Figma exports).

Your responsibilities:
*   Strictly adhere to the color palettes, typography, and geometry defined in this document. 
*   Analyze the provided mockups to determine the exact layout, structural hierarchy, and component composition.
*   Translate the visual layout into clean, accessible, and responsive code.
*   Never invent styles, colors, or spacing that contradict the provided style guide. Ensure all interactive elements, border radius, shadow depths, and typography choices perfectly align with the established design rules.

**CRITICAL STYLING RULE:** All styling must strictly adhere to the custom variables and base layers defined in `resources/css/app.css`. Do not invent hex codes or arbitrary spacing.

### Color Palette
* **Primary Brand Color (Blue):** Used strictly for high-priority actions, primary buttons (e.g., "Buat Event", "Daftar"), active states, and primary navigation elements. 
    * *Implementation:* Use the `primary` scale (e.g., `bg-primary-500 hover:bg-primary-600`).
* **Secondary Brand Color (Yellow/Orange):** Used for subtle highlights, specific badges, or secondary interactive elements.
    * *Implementation:* Use the `secondary` scale (e.g., `bg-secondary-200 text-secondary-800`).
* **Backgrounds & Surfaces:** * Base application background is pure white (`bg-white`). 
    * For borders and subtle dividers, use the neutral layer defined in base (`border-neutral-200`).
    * For light surface separations, use the lower end of the gray scale (e.g., `bg-gray-100`).

### Typography & Base Layers
Typography is strictly controlled by `@layer base` and custom variables to ensure perfect responsive scaling between mobile and web views. The primary font is **Plus Jakarta Sans** (`font-brand`).
* **Headings (`<h1>` to `<h6>`):** Always use semantic HTML heading tags. Do NOT manually apply text sizes to headings. The `app.css` automatically handles responsive font sizing (e.g., scaling `<h1>` from `3rem` on mobile to `4rem` on web) and applies `font-brand`.
* **Body Text:** Use standard text classes mapped to the custom theme.
    * Main body text defaults to `text-neutral-900`. 
    * For specific text sizing, utilize the configured utilities mapping to `--text-large`, `--text-base`, `--text-small`, and `--text-micro`.

### UI Components & Geometry
* **Cards & Containers:** Event cards and form containers feature distinct, soft rounded corners driven by the theme variables. Use `rounded-lg`, `rounded-md`, or `rounded-sm`.
* **Buttons:** Call-to-action buttons are heavily rounded rectangles (e.g., `rounded-lg` or `rounded-full` if fully pill-shaped).
* **Inputs & Forms:** Form fields are cleanly separated, utilizing `border-neutral-200` as defined in the global selector.
* **Shadows & Depth:** Diffuse, soft drop shadows (`shadow-sm`, `shadow-md`) are used sparingly on floating elements like modals or prominent event cards.

---

## Responsive Implementation Strategy (CRITICAL)

**Mockup Limitation Notice:** The provided Figma design mockups strictly represent the **desktop (fullscreen) view**. They have not been designed for mobile or tablet screens. 

As an Expert Frontend Developer, you must autonomously translate these desktop layouts into fully responsive interfaces using a **Mobile-First approach** with Tailwind CSS (`sm:`, `md:`, `lg:`, `xl:` prefixes). 

When translating the desktop mockups to mobile, strictly enforce the following responsive rules while maintaining the core design system:
* **Grid & Flex Layouts:** Convert multi-column desktop layouts (e.g., event grids, side-by-side form panels) into single-column vertical stacks on mobile (`flex-col`, `grid-cols-1`). 
* **Navigation:** Collapse the primary desktop sidebar or top navigation into a mobile-friendly hamburger menu or bottom navigation bar for smaller screens (`< md`).
* **Spacing & Padding:** Reduce generous desktop whitespace for mobile. Scale down container paddings (e.g., transition from `p-8` on desktop to `p-4` on mobile) to maximize usable screen real estate.
* **Typography:** Rely on the global `app.css` heading tags (which already scale between `--text-h1-mobile` and `--text-h1-web`). Do not hardcode fixed text sizes that break mobile readability.
* **Touch Targets:** Ensure all interactive elements (buttons, form inputs, toggles) maintain a minimum height of `44px` (e.g., `h-11` or `h-12` in Tailwind) on mobile to accommodate touch interactions.

## 3. Inertia.js Data Flow Constraints

* **Dual-Layer Routing Note:** Every feature is split into two endpoints. Web (`routes/web.php`) uses session-based authentication and returns `Inertia::render()`. Mobile (`routes/api.php`) uses stateless Sanctum tokens and returns JSON. **This web client ONLY interacts with the web routes.**
* **Data Mutations:** All `POST`, `PUT`, and `DELETE` requests **MUST** be handled using state-based form submissions (utilizing the `useForm` hook from `@inertiajs/react`).
* **No Mutation Links:** Do **NOT** use Inertia `<Link>` components for destructive or write actions. `<Link>` is reserved strictly for `GET` navigation.
* **File Handling:** Forms that upload files must properly handle `multipart/form-data` within the Inertia `useForm` structure.

---

## 4. Conditional Form Logic (Event Schema)

When building forms for creating or editing events, strict dynamic rendering and conditional validation states are required based on the event type:

* **Online Events:** If `type == 'online'`, render and require the `platform_name` and `link` inputs. Hide offline-specific fields.
* **Offline Events:** If `type == 'offline'`, render and require the `location_name` and `gmaps_url` inputs. Hide online-specific fields.

---

## 5. Role-Based Access Control (RBAC)

UI elements must conditionally render based on the user's role, provided via Inertia shared props (e.g., `auth.user`).

* **Guest (Public):** Can search, filter (by category), and view event details. Cannot perform write operations. Interactive actions (e.g., "Join Event") must trigger an Inertia redirect to the login route or challenge modal.
* **User (Authenticated):** Can update profiles, track registered events, host events, manage event details, trigger email reminders, generate/scan attendee QR codes, issue e-certificates, and report fraudulent events.
* **Admin (Superuser):** Inherits all User capabilities. Accesses a dedicated panel to review event reports, ban malicious events, and suspend/ban user accounts. Conditionally render admin navigation links if `auth.user.role === 'admin'`.

## 6. Immediate Action Required
Do not generate the code for all interfaces at once. Acknowledge that you understand these constraints, make a planning, and ask formy permission to proceed executing the interface for the design mockup provided.